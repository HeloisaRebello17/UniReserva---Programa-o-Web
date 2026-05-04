const logger = require('../utils/logger');

// Middleware de request logging
function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id
    });
  });

  next();
}

// Middleware de error logging
function errorLogger(err, req, res, next) {
  logger.error(`Error in ${req.method} ${req.path}`, err);
  next(err);
}

// Middleware de autenticação com logging
function authLoggingMiddleware(req, res, next) {
  if (req.user) {
    logger.debug('Authenticated request', {
      userId: req.user.id,
      userType: req.user.type,
      email: req.user.email
    });
  }
  next();
}

module.exports = {
  requestLogger,
  errorLogger,
  authLoggingMiddleware
};
