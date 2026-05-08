import axios from 'axios';

const API_BASE = 'http://4.224.186.213/evaluation-service';

const authToken = process.env.REACT_APP_NOTIFICATION_TOKEN;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: {
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
  }
});

function unpackNotifications(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export async function fetchNotifications({ page = 1, limit = 10, notificationType = 'All' } = {}) {
  const params = {
    page,
    limit
  };

  if (notificationType && notificationType !== 'All') {
    params.notification_type = notificationType;
  }

  const response = await api.get('/notifications', { params });
  const notifications = unpackNotifications(response.data);

  return {
    notifications,
    raw: response.data,
    hasMore: notifications.length >= limit
  };
}
