const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.getAllCategories);
router.post('/', productController.createProductCategory);
router.get('/:id', productController.getProductByCategoryId);
router.put('/:id', productController.updateProductCategory);
router.delete('/:id', productController.deleteProductCategory);

module.exports = router;
