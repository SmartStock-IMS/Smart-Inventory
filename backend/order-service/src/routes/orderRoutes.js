const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('customer_id').isInt().withMessage('Customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.product_id').isInt().withMessage('Product ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const assignOrderValidation = [
  body('orderId').isUUID().withMessage('Valid order ID is required'),
  body('resourceManagerId').isUUID().withMessage('Valid resource manager ID is required')
];

// Routes
// Get comprehensive order data
router.get('/all-data', orderController.getAllOrdersData.bind(orderController));
router.get('/:id', orderController.getOrderById);
router.post('/', createOrderValidation, orderController.createOrder);
router.get('/by-sales-rep/:id', orderController.getOrdersBySalesRepId.bind(orderController));
router.patch('/status/:id',orderController.updateOrderStatus);
router.post('/assign', authMiddleware(['inventory_manager']),   assignOrderValidation, orderController.assignOrderToResourceManager);
router.get('/by-resource-manager/:id', orderController.getOrdersByRMId.bind(orderController));
//router.delete('/:id', orderController.deleteOrder);

module.exports = router;
