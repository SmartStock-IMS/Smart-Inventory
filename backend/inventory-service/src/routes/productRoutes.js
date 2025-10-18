const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');

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

// Validation rules
const createProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('category_name').notEmpty().withMessage('Category is required'),
  body('cost_price').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('selling_price').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('image_url').optional().isURL().withMessage('Image URL must be valid'),
  body('initial_quantity').optional().isInt({ min: 0 }).withMessage('Initial quantity must be a non-negative integer')
];

const updateProductValidation = [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

// Routes
router.post('/upload-image', upload.single('image'), productController.uploadProductImage);
router.get('/popular',authMiddleware(['admin','inventory_manager']), productController.getMostPopularProducts);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/',authMiddleware(['admin','inventory_manager']), createProductValidation, productController.createProduct);
router.put('/:id', updateProductValidation, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
