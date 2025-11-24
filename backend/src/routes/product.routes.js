// src/routes/products.routes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const secure = require("../middleware/auth.secure");

// --------------------------------------
// 🌐 PUBLIC SEARCH (không cần token)
// POST /products/public/search
// --------------------------------------
router.post(
  "/public/search",
  productController.searchProductsPublic
);

// --------------------------------------
// 🔍 ADMIN/MANUFACTURER SEARCH
// POST /products/search
// --------------------------------------
router.post(
  "/search",
  secure(["admin", "manufacturer"]),
  productController.searchProducts
);

// --------------------------------------
// ➕ Tạo sản phẩm
// --------------------------------------
router.post(
  "/",
  secure(["admin", "manufacturer"]),
  productController.createProduct
);

// --------------------------------------
// ♻ Cập nhật sản phẩm
// --------------------------------------
router.put(
  "/:id",
  secure(["admin", "manufacturer"]),
  productController.updateProduct
);

// --------------------------------------
// 🗑 Soft delete sản phẩm
// --------------------------------------
router.delete(
  "/:id",
  secure(["admin", "manufacturer"]),
  productController.deleteProduct
);
router.get('/', secure(['admin', 'manufacturer']), productController.getAllProducts);
module.exports = router;
