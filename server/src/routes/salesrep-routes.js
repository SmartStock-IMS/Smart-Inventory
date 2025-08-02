const express = require("express");
const router = express.Router();
const salesRepController = require("../controller/salesrep-controller");
const authorizeRoles = require("../utils/auth-roles");

router.post(
  "/add",
  authorizeRoles("001", "002"),
  salesRepController.createSalesRep,
);
router.put(
  "/update/:emp_code",
  authorizeRoles("002"),
  salesRepController.updateSalesRep,
);
router.delete(
  "/delete/:emp_code",
  authorizeRoles("002"),
  salesRepController.deleteSalesRep,
);
router.get(
  "/get/:emp_code",
  authorizeRoles("001", "002"),
  salesRepController.getSalesRep,
);
router.get(
  "/get-all",
  authorizeRoles("001", "002"),
  salesRepController.getAllSalesReps,
);

module.exports = router;
