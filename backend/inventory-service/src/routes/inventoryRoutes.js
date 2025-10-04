const express = require('express');
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

// Validation rules
const updateInventoryValidation = [
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('type').optional().isIn(['set', 'add', 'subtract']).withMessage('Invalid type')
];

const reserveInventoryValidation = [
  body('product_id').isInt().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
];
// Routes
/*
router.get('/', inventoryController.getInventoryLevels);
router.put('/:id', updateInventoryValidation, inventoryController.updateInventory);
router.post('/reserve', reserveInventoryValidation, inventoryController.reserveInventory);
router.post('/release', reserveInventoryValidation, inventoryController.releaseReservation);
*/

// Vehicle Routes
router.post('/vehicle', inventoryController.createVehicle);
router.get('/vehicle', inventoryController.getAllVehicles);
router.get('/vehicle/:id', inventoryController.getVehicleById);
router.put('/vehicle/:id', inventoryController.updateVehicle);
router.delete('/vehicle/:id', inventoryController.deleteVehicle);

// Stock Movement Routes
router.post('/stock-movement', inventoryController.createStockMovement);
router.get('/stock-movement/inprogress/:resource_manager_id', inventoryController.getInProgressStockMovements);
router.patch('/stock-movement/:movement_id/complete', inventoryController.completeStockMovement);

module.exports = router;
