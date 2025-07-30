const winston = require('winston');

// Create transports array based on environment
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// Only add file transports in development/local environments
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: transports
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
