const express = require("express");
const reportController = require("../controller/report-controller");
const router = express.Router();

router.get("/daily-summary", reportController.getDailySummary);

router.get("/qb-summary", reportController.qbSummary)

module.exports = router;