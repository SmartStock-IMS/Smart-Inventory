const express = require("express");
const router = express.Router();
const quotationController = require("../controller/quotation-controller");
const productController = require("../controller/product-controller");

router.get("/get-all-quotations", quotationController.getQuotations);
router.get("/get-quotations", quotationController.getQuotationsBySalesRep);
router.get("/get-quotations-by-customer", quotationController.getQuotationsByCustomer);
router.get("/get-invoice/:id", quotationController.getInvoice);
router.post("/create", quotationController.creatQuotation);

router.put("/:id", quotationController.updateQuotationStatus);
router.put("/update-qty/:id", quotationController.updateQuotationProductQuantity);

module.exports = router;
