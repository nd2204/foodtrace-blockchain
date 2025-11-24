/**
 * 🖼️ media.controller.js
 * Upload và quản lý file (ảnh, pdf, chứng nhận, kiểm định)
 */

const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { getPool } = require("../config/db.config");

// ⚙️ Cấu hình upload folder (local)
const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Nếu chưa có thư mục thì tạo
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ⚙️ Cấu hình Multer (middleware lưu file)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// 🧠 Controller
const mediaController = {
  /**
   * 📤 Upload file cho một entity
   */
  uploadFile: async (req, res) => {
    const { entity_type, entity_id, caption } = req.body;
    const file = req.file;
    const userId = req.user?.userId || null;

    if (!file) return res.status(400).json({ success: false, error: "Thiếu file để upload" });
    if (!entity_type || !entity_id)
      return res.status(400).json({ success: false, error: "Thiếu entity_type hoặc entity_id" });

    const pool = await getPool();
    try {
      const fileUrl = `/uploads/${file.filename}`;
      const fileType = file.mimetype.startsWith("image") ? "image" : "document";

      await pool.query(
        `INSERT INTO media_files (entity_type, entity_id, file_url, file_type, caption, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [entity_type, entity_id, fileUrl, fileType, caption || null, userId]
      );

      res.status(201).json({
        success: true,
        message: "Upload thành công",
        data: { entity_type, entity_id, fileUrl, caption },
      });
    } catch (err) {
      console.error("❌ Upload error:", err);
      res.status(500).json({ success: false, error: "Lỗi khi upload file" });
    }
  },

  /**
   * 📋 Lấy danh sách file theo entity
   */
  getFilesByEntity: async (req, res) => {
    const { entity_type, entity_id } = req.params;
    try {
      const pool = await getPool();
      const [rows] = await pool.query(
        `SELECT * FROM media_files WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC`,
        [entity_type, entity_id]
      );
      res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error("getFilesByEntity error:", err);
      res.status(500).json({ success: false, error: "Không lấy được danh sách file" });
    }
  },
};

module.exports = { mediaController, upload };
