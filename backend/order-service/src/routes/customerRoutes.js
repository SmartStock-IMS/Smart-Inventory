const express = require('express');
const { body, validationResult } = require('express-validator');
const customerController = require('../controllers/customerController');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('=== VALIDATION ERRORS ===');
    console.error('Validation errors:', JSON.stringify(errors.array(), null, 2));
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    console.error('Request headers:', JSON.stringify(req.headers, null, 2));
    console.error('=========================');
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      receivedData: req.body
    });
  }
  next();
};

// Validation rules
const createCustomerValidation = [
  body('customer_id').optional().isString().withMessage('Customer ID must be a string'),
  body('first_name').notEmpty().trim().withMessage('First name is required'),
  body('last_name').notEmpty().trim().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('contact_no').notEmpty().withMessage('Phone number is required'),
  body('address').notEmpty().trim().withMessage('Address is required'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'PENDING']).withMessage('Invalid status'),
  body('contact2').optional().isString(),
  body('notes').optional().isString(),
  body('profile_pic').optional().isString()
];

// Routes
router.get('/', customerController.getAllCustomers);
router.get('/next-id', customerController.getNextCustomerId);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer); // Temporarily removed validation
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
