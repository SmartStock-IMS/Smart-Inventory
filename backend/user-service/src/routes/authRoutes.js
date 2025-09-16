const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters long'),
  body('first_name')
    .notEmpty()
    .withMessage('First name is required'),
  body('last_name')
    .notEmpty()
    .withMessage('Last name is required'),
  body('role')
    .optional()
    .isIn(['admin', 'inventory_manager', 'sales_staff', 'resource_manager', 'user'])
    .withMessage('Invalid role'),
  body('phone')
    .optional()
    .isString()
    .withMessage('Phone must be a string'),
  body('address')
    .optional()
    .isString()
    .withMessage('Address must be a string'),
  body('branch')
    .optional()
    .isString()
    .withMessage('Branch must be a string'),
  body('nic')
    .optional()
    .isString()
    .withMessage('NIC must be a string')
];

// Routes
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);
router.post('/refresh', authController.refreshToken);  // not checked
router.post('/validate', authController.validateToken); // not checked

module.exports = router;
