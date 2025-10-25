const express = require('express');
const supplierController = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


// Get all suppliers
router.get('/', authMiddleware(['admin', 'inventory_manager']), supplierController.getAllSuppliers);

// Create new supplier (accept JSON like sales rep system)
router.post('/', authMiddleware(['admin', 'inventory_manager']), supplierController.createSupplier);

// Product-supplier assignment routes (MUST be before /:id routes)
router.post('/product-assignments', authMiddleware(['admin', 'inventory_manager']), supplierController.saveProductSupplierAssignments);
router.get('/product-assignments', authMiddleware(['admin', 'inventory_manager']), supplierController.getProductSupplierAssignments);

// Restock orders routes (MUST be before /:id routes)
router.post('/restock-orders', authMiddleware(['admin', 'inventory_manager']), supplierController.createRestockOrders);
router.get('/restock-orders', authMiddleware(['admin', 'inventory_manager']), supplierController.getRestockOrders);

// Supplier order management routes  
router.post('/orders', authMiddleware(['admin', 'inventory_manager']), supplierController.createSupplierOrder);
router.get('/orders', authMiddleware(['admin', 'inventory_manager']), supplierController.getSupplierOrders);   
router.get('/orders/:id', authMiddleware(['admin', 'inventory_manager']), supplierController.getSupplierOrderById);

// Get supplier by ID (MUST be after specific routes)
router.get('/:id', authMiddleware(['admin', 'inventory_manager']), supplierController.getSupplierById);        

// Update supplier (accept JSON like sales rep system)
router.put('/:id', authMiddleware(['admin', 'inventory_manager']), supplierController.updateSupplier);

// Delete supplier
router.delete('/:id', authMiddleware(['admin', 'inventory_manager']), supplierController.deleteSupplier);      

module.exports = router;
