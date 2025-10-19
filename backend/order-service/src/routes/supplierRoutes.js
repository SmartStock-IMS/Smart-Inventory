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

router.get('/', authMiddleware(['admin', 'inventory_manager']), supplierController.getAllSuppliers);
router.post('/', authMiddleware(['admin', 'inventory_manager']), supplierController.createSupplier);

module.exports = router;
