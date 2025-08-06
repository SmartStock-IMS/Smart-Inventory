const rateLimit = require('express-rate-limit');
const config = require('../config/config');

const createRateLimit = (windowMs = config.rateLimit.windowMs, max = config.rateLimit.max) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const authLimiter = createRateLimit(15 * 60 * 1000, 5); // 5 requests per 15 minutes
const generalLimiter = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes

module.exports = {
  authLimiter,
  generalLimiter,
  createRateLimit,
};