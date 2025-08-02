const express = require("express");
const router = express.Router();
const userController = require("../controller/user-controller");
const customerController = require("../controller/customer-controller");
const authorizeRoles = require("../utils/auth-roles");

router.post(
  "/add",
  authorizeRoles("001", "002"),
  userController.createCustomer,
);
router.put(
  "/update/:user_code",
  authorizeRoles("002"),
  userController.updateCustomer,
);
router.delete(
  "/delete/:user_code",
  authorizeRoles("002"),
  userController.deleteCustomer,
);
router.get(
  "/get/:user_code",
  authorizeRoles("001", "002"),
  // userController.getCustomer,
  customerController.getCustomerByUserCode,
);
router.get(
  "/get-all",
  authorizeRoles("001", "002"),
  userController.getCustomers,
);

router.get("/get-all-customers", authorizeRoles("001", "002"), customerController.getCustomers);

router.get("/get-all-customers-no-page", authorizeRoles("001", "002"), customerController.getAllCustomers);

module.exports = router;
