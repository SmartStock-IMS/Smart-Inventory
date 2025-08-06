const { body, param, query } = require('express-validator');
const { USER_ROLES } = require('../utills/constants');

const validationRules = {
  register: [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('first_name')
      .isLength({ min: 1, max: 50 })
      .withMessage('First name is required'),
    body('last_name')
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name is required'),
    body('role')
      .isIn(Object.values(USER_ROLES))
      .withMessage('Invalid role specified'),
  ],

  login: [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  uuidParam: [
    param('id').isUUID().withMessage('Valid ID is required'),
  ],

  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
};

module.exports = validationRules;