// src/routes/lab_tests.routes.js
const express = require("express");
const router = express.Router();
const labTestController = require("../controllers/lab_tests.controller");
const secure = require("../middleware/auth.secure");
const { upload } = require("../controllers/media.controller");

// --------------------------------------
// ➕ Tạo kiểm định (admin, manufacturer)
// --------------------------------------
router.post(
  "/",
  secure(["admin", "manufacturer"]),
  upload.array("files", 4),
  labTestController.createLabTest
);

// --------------------------------------
// 🔍 Search kiểm định (QueryModel)
// POST /lab-tests/search
// --------------------------------------
router.post(
  "/search",
  secure(["admin", "manufacturer"]),
  labTestController.searchLabTests
);

// --------------------------------------
// 📄 Lấy kiểm định theo batch
// GET /lab-tests/batch/:batch_id
// --------------------------------------
router.get(
  "/batch/:batch_id",
  secure(["admin", "manufacturer"]),
  labTestController.getTestsByBatch
);

module.exports = router;
