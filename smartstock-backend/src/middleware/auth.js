const jwt = require('jsonwebtoken');
const config = require('../config/config');
const ApiResponse = require('../utills/response');
const User = require('../models/userModel');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return ApiResponse.error(res, 'Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);

    if (!user || user.status !== 'active') {
      return ApiResponse.error(res, 'Invalid token or user not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    ApiResponse.error(res, 'Invalid token', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        'Access denied. Insufficient permissions.',
        403
      );
    }
    next();
  };
};

module.exports = { auth, authorize };