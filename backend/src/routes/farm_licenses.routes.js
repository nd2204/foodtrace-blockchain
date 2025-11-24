// src/routes/farm_licenses.routes.js
const express = require("express");
const router = express.Router();
const farmLicenseController = require("../controllers/farm_licenses.controller");
const secure = require("../middleware/auth.secure");
const { upload } = require("../controllers/media.controller");

// --------------------------------------
// ➕ Tạo giấy chứng nhận (upload file)
// --------------------------------------
router.post(
  "/",
  secure(["admin", "manufacturer"]),
  upload.array("files", 4),
  farmLicenseController.createLicense
);

// --------------------------------------
// 🔍 Search license (C# style)
// POST /licenses/search
// --------------------------------------
router.post(
  "/search",
  secure(["admin", "manufacturer"]),
  farmLicenseController.searchLicenses
);

// --------------------------------------
// 📄 Xem chi tiết license theo ID
// --------------------------------------
router.get(
  "/:id",
  secure(["admin", "manufacturer"]),
  farmLicenseController.getLicenseById
);

// --------------------------------------
// 🗑 Xóa giấy chứng nhận (soft delete nếu có)
// --------------------------------------
router.delete(
  "/:id",
  secure(["admin", "manufacturer"]),
  farmLicenseController.deleteLicense
);

module.exports = router;
