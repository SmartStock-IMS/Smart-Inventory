const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();



/*
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', createProductValidation, productController.createProduct);
router.put('/:id', updateProductValidation, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
*/

router.get('/', productController.getAllCategories);
router.post('/', productController.createProductCategory);

module.exports = router;
