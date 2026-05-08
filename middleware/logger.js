const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const winston = require('winston');

const logDir = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 1024 * 1024,
      maxFiles: 3
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const requestLogger = morgan((tokens, req, res) => {
  return JSON.stringify({
    type: 'request',
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
}, {
  immediate: true,
  stream: {
    write: (message) => {
      try {
        logger.info('incoming request', JSON.parse(message));
      } catch (err) {
        logger.info(message.trim());
      }
    }
  }
});

const responseLogger = morgan((tokens, req, res) => {
  return JSON.stringify({
    type: 'response',
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    contentLength: tokens.res(req, res, 'content-length'),
    responseTimeMs: Number(tokens['response-time'](req, res))
  });
}, {
  stream: {
    write: (message) => {
      try {
        const data = JSON.parse(message);
        const level = data.status >= 500 ? 'error' : data.status >= 400 ? 'warn' : 'info';
        logger.log(level, 'request finished', data);
      } catch (err) {
        logger.info(message.trim());
      }
    }
  }
});

module.exports = {
  logger,
  requestLogger,
  responseLogger
};
