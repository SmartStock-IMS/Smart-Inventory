const express = require("express");
const router = express.Router();
const userController = require("../controller/user-controller");

router.post("/add", userController.creatUser);

router.get("/get-all", userController.getUsers);
router.get("/get-user", userController.getUser);
router.get("/get-customers", userController.getCustomers);


module.exports = router;
