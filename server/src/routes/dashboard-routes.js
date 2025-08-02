const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboard-controller");
const authorizeRoles = require("../utils/auth-roles");

router.get("/income", authorizeRoles("001", "002"), dashboardController.getIncomeData);
router.get("/products", authorizeRoles("001", "002"), dashboardController.getPopularProducts);
router.get("/overview", authorizeRoles("001", "002"), dashboardController.getOverviewData);

module.exports = router;