const express = require("express");
const router = express.Router();
const productController = require("../controller/product-controller");
const multer = require("multer");

const upload = multer({ dest: "./src/assets/" });

// retrieve
router.get("/get/:id", productController.getProduct);
router.get("/get-all", productController.getProducts);
router.get("/get-variants", productController.getProductVariants);

// manage
router.post("/add", productController.addProduct);
router.put("/update/:id", productController.updateProduct);
router.put("/update-quantity", productController.updateVariantQuantity);
router.delete("/delete/:id", productController.deleteProduct);
router.delete("/delete-variant/:id", productController.deleteVariant);
router.post(
  "/upload-image",
  upload.single("image"), // multer middleware
  productController.uploadImage,
);

router.delete("/delete-file", productController.removeImage);

module.exports = router;
