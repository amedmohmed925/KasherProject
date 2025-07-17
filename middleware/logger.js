const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const logRequests = (req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    body: req.body,
    user: req.user ? req.user._id : null
  });
  next();
};

module.exports = { logger, logRequests };
