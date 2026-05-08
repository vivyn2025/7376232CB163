const axios = require('axios');
const { logger } = require('../middleware/logger');
const {
  pickNotificationList,
  buildTopNotifications
} = require('../utils/priorityHelper');

const NOTIFICATION_API =
  process.env.NOTIFICATION_API_URL ||
  'http://4.224.186.213/evaluation-service/notifications';

const requestTimeout = Number(process.env.API_TIMEOUT_MS || 6000);
const maxRetries = Number(process.env.API_RETRIES || 2);

const client = axios.create({
  timeout: requestTimeout,
  headers: {
    Accept: 'application/json'
  }
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normaliseAxiosError(err) {
  if (err.response) {
    return `status ${err.response.status}`;
  }
  if (err.code === 'ECONNABORTED') {
    return 'request timeout';
  }
  return err.message || 'unknown api error';
}

async function fetchNotifications() {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
    const startedAt = Date.now();

    try {
      logger.info('fetching notifications from source api', {
        attempt,
        timeoutMs: requestTimeout
      });

      const response = await client.get(NOTIFICATION_API);

      logger.info('notification api responded', {
        attempt,
        status: response.status,
        tookMs: Date.now() - startedAt
      });

      return response.data;
    } catch (err) {
      lastError = err;
      logger.warn('notification api request failed', {
        attempt,
        reason: normaliseAxiosError(err),
        tookMs: Date.now() - startedAt
      });

      if (attempt <= maxRetries) {
        await wait(350 * attempt);
      }
    }
  }

  const wrapped = new Error(`Notification API unavailable: ${normaliseAxiosError(lastError)}`);
  wrapped.status = 502;
  wrapped.publicMessage = 'Could not fetch notifications right now';
  throw wrapped;
}

async function getPriorityInbox({ limit = 10 } = {}) {
  const startedAt = Date.now();
  const payload = await fetchNotifications();
  const notifications = pickNotificationList(payload);

  logger.info('processing notification payload', {
    received: notifications.length,
    limit
  });

  const topItems = buildTopNotifications(notifications, limit);

  logger.info('priority ranking finished', {
    inputCount: notifications.length,
    outputCount: topItems.length,
    tookMs: Date.now() - startedAt
  });

  return topItems;
}

module.exports = {
  fetchNotifications,
  getPriorityInbox
};
