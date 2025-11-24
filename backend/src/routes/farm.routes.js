// src/routes/farms.routes.js
const express = require("express");
const router = express.Router();
const farmController = require("../controllers/farm.controller");
const secure = require("../middleware/auth.secure");
const { upload } = require("../controllers/media.controller");

// --------------------------------------
// ➕ Tạo farm (admin / manufacturer)
// --------------------------------------
router.post(
  "/",
  secure(["admin", "manufacturer"]),
  upload.array("files", 6),
  farmController.createFarm
);

// --------------------------------------
// 🔍 Search farms (C# style QueryModel)
// POST /farms/search
// --------------------------------------
router.post(
  "/search",
  secure(["admin", "manufacturer"]),
  farmController.searchFarms
);

// --------------------------------------
// 📄 Xem chi tiết farm
// (admin/manufacturer - riêng trace dùng API public khác)
// --------------------------------------
router.get(
  "/:id",
  secure(["admin", "manufacturer"]),
  farmController.getFarmById
);

// --------------------------------------
// 🗑 Soft-delete farm
// --------------------------------------
router.delete(
  "/:id",
  secure(["admin", "manufacturer"]),
  farmController.deleteFarm
);

module.exports = router;
