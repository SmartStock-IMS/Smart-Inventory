const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully'
  });
});

/*
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', createProductValidation, productController.createProduct);
router.put('/:id', updateProductValidation, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
*/

module.exports = router;
