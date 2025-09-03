const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

const updateProductValidation = [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

// Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', createProductValidation, productController.createProduct);
router.put('/:id', updateProductValidation, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
