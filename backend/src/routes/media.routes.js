const express = require("express");
const router = express.Router();
const { mediaController, upload } = require("../controllers/media.controller");
const auth = require("../middleware/auth.secure");

// 📤 Upload file
router.post("/media/upload", auth(["admin", "manufacturer"]), upload.single("file"), mediaController.uploadFile);

// 📄 Lấy danh sách file của entity
router.get("/media/:entity_type/:entity_id", auth(["admin", "manufacturer", "user"]), mediaController.getFilesByEntity);

module.exports = router;
