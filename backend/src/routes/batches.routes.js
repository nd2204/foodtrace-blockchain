// src/routes/batches.routes.js
const express = require("express");
const router = express.Router();
const batchesController = require("../controllers/batches.controller");
const secure = require("../middleware/auth.secure");
const { upload } = require("../controllers/media.controller");

// ------------------------------
// ➕ Tạo batch (admin + manufacturer)
// ------------------------------
router.post(
  "/",
  secure(["admin", "manufacturer"]),
  upload.array("files", 8),
  batchesController.createBatch
);

// ------------------------------
// 🔍 Search batch (C# QueryModel style)
// POST /batches/search
// ------------------------------
router.post(
  "/search",
  secure(["admin", "manufacturer"]),
  batchesController.searchBatches
);

// ------------------------------
// 📄 Xem chi tiết batch theo ID
// ------------------------------
router.get(
  "/:id",
  secure(["admin", "manufacturer"]),
  batchesController.getBatchById
);

module.exports = router;
