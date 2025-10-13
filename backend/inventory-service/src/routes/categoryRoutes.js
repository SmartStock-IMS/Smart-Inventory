const express = require('express');
const productController = require('../controllers/productController');
const multer = require('multer');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post('/upload-image', upload.single('image'), productController.uploadProductImage);
router.get('/', productController.getAllCategories);
router.post('/', productController.createProductCategory);
router.get('/:id', productController.getProductByCategoryId);
router.put('/:id', productController.updateProductCategory);
router.delete('/:id', productController.deleteProductCategory);

module.exports = router;
