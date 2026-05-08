require('dotenv').config();

const express = require('express');
const { logger, requestLogger, responseLogger } = require('./middleware/logger');
const { getPriorityInbox } = require('./services/notificationService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);
app.use(responseLogger);

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'campus-priority-inbox',
    stage: '1'
  });
});

app.get('/notifications/priority', async (req, res, next) => {
  const startedAt = Date.now();

  try {
    const limit = Number(req.query.limit || 10);
    const inbox = await getPriorityInbox({
      limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10
    });

    logger.info('priority inbox request completed', {
      returned: inbox.length,
      tookMs: Date.now() - startedAt
    });

    res.json({
      count: inbox.length,
      notifications: inbox
    });
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  logger.error('request failed', {
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });

  res.status(err.status || 500).json({
    error: err.publicMessage || 'Something went wrong while processing notifications'
  });
});

app.listen(PORT, () => {
  logger.info(`priority inbox server started on port ${PORT}`);
});
