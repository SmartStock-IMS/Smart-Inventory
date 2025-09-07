const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');

const router = express.Router();

// Validation rules
const createCustomerValidation = [
  body('name').notEmpty().withMessage('Customer name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required')
  
];

// Routes
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', createCustomerValidation, customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
