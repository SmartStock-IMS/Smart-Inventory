const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Placeholder routes for reports
router.get('/sales', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sales report endpoint - implementation pending',
    data: { 
      total_sales: 0,
      orders_count: 0,
      period: req.query.period || 'monthly'
    }
  });
});

router.get('/customers', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Customer report endpoint - implementation pending',
    data: { 
      total_customers: 0,
      new_customers: 0,
      period: req.query.period || 'monthly'
    }
  });
});

// Real daily summary endpoints
router.get('/daily-summary', orderController.getDailySummary);
router.get('/daily-summary-stats', orderController.getDailySummaryStats);
router.get('/daily-status-options', orderController.getDailyStatusOptions);

// Real weekly summary endpoints
router.get('/weekly-summary', orderController.getWeeklySummary);
router.get('/weekly-summary-stats', orderController.getWeeklySummaryStats);
router.get('/weekly-status-options', orderController.getWeeklyStatusOptions);

// Real yearly summary endpoints
router.get('/yearly-summary', orderController.getYearlySummary);
router.get('/yearly-summary-stats', orderController.getYearlySummaryStats);
router.get('/monthly-breakdown', orderController.getMonthlyBreakdown);
router.get('/yearly-status-options', orderController.getYearlyStatusOptions);

module.exports = router;
