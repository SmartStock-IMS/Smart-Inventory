const express = require('express');
const supplierController = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const roleGuard = (allowedRoles = []) => (req, res, next) => {
	const role = req.get('X-User-Role'); // set by API Gateway
	if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
		return res.status(403).json({ success: false, message: 'Insufficient permissions' });
	}
	next();
};

// Get all suppliers
router.get('/', authMiddleware(['admin', 'inventory_manager']), supplierController.getAllSuppliers);

// Create new supplier (accept JSON like sales rep system)
router.post('/', authMiddleware(['admin', 'inventory_manager']), supplierController.createSupplier);

// Get supplier by ID
router.get('/:id', authMiddleware(['admin', 'inventory_manager']), supplierController.getSupplierById);

// Update supplier (accept JSON like sales rep system)
router.put('/:id', authMiddleware(['admin', 'inventory_manager']), supplierController.updateSupplier);

// Delete supplier
router.delete('/:id', authMiddleware(['admin', 'inventory_manager']), supplierController.deleteSupplier);

// Supplier order management routes
router.post('/orders', authMiddleware(['admin', 'inventory_manager']), supplierController.createSupplierOrder);
router.get('/orders', authMiddleware(['admin', 'inventory_manager']), supplierController.getSupplierOrders);
router.get('/orders/:id', authMiddleware(['admin', 'inventory_manager']), supplierController.getSupplierOrderById);

module.exports = router;
