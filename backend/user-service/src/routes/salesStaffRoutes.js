const express = require('express');
const salesStaffController = require('../controllers/salesStaffController');

const router = express.Router();

// Sales Staff Routes
router.post('/', salesStaffController.createSalesStaff);
router.get('/', salesStaffController.getAllSalesStaff);
router.get('/:id', salesStaffController.getSalesStaffById);
router.put('/:id', salesStaffController.updateSalesStaff);
router.delete('/:id', salesStaffController.deleteSalesStaff);

module.exports = router;