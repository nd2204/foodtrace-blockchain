const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const secure = require("../middleware/auth.secure");

// 📊 Tổng quan dashboard
router.get(
  "/summary",
  secure(["admin", "manufacturer"]),
  dashboardController.summary
);

// 📈 Biểu đồ batch: daily / monthly / yearly
router.get(
  "/batch-stats",
  secure(["admin", "manufacturer"]),
  dashboardController.batchStats
);

module.exports = router;
