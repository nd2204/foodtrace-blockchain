const express = require('express');
const router = express.Router();
const traceController = require('../controllers/trace.controller');

// 🧾 Tóm tắt cơ bản (dành cho quét QR)
router.get('/:batch_number', traceController.traceByBatchNumber);

// 🔍 Chi tiết mở rộng (nếu người dùng ấn "Xem thêm")
router.get('/:batch_number/details', traceController.getTraceDetails);

module.exports = router;
