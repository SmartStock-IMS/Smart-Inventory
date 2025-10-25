const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Variant routes
router.get('/', productController.getAllVariants);
router.get('/product/:productId', productController.getVariantsByProduct);

module.exports = router;