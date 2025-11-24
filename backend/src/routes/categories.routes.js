// src/routes/categories.routes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const secure = require("../middleware/auth.secure");

// --------------------------------------
// 🔍 Search categories (C# style)
// POST /categories/search
// --------------------------------------
router.post(
  "/search",
  secure(["admin"]),
  categoryController.searchCategories
);

// --------------------------------------
// ➕ Tạo category
// --------------------------------------
router.post(
  "/",
  secure(["admin"]),
  categoryController.createCategory
);

// --------------------------------------
// ♻ Cập nhật category
// --------------------------------------
router.put(
  "/:id",
  secure(["admin"]),
  categoryController.updateCategory
);

// --------------------------------------
// 🗑 Xóa category
// --------------------------------------
router.delete(
  "/:id",
  secure(["admin"]),
  categoryController.deleteCategory
);
router.get(
    "/", 
    secure(['admin']), 
    categoryController.getAllCategories
);
module.exports = router;
