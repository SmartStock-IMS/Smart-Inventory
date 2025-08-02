const express = require("express");
const router = express.Router();
const orderController = require("../controller/order-controller");

router.get("/get/:status", orderController.getOrders);
router.post("/create", orderController.creatOrder);

module.exports = router;
