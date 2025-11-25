/**
 * 🌾 farm.controller.js
 * Quản lý thông tin nông trại (Farms)
 * Có phân quyền, upload ảnh, MiniSearch và (tùy chọn) ghi blockchain
 */

const crypto = require("crypto");
const { getPool } = require("../config/db.config");
const { contract } = require("../config/blockchain");
const SearchService = require("../services/search.service"); // ✅ MiniSearch
const FarmsQuery = require("../requests/FarmsQuery");

/**
 * 🧩 Tạo hash farm
 */
function createFarmHash(farm) {
  const json = JSON.stringify(farm);
  return crypto.createHash("sha256").update(json).digest("hex");
}

const farmController = {
  /**
   * 🌱 Tạo nông trại mới
   */
  createFarm: async (req, res) => {
    const {
      name,
      owner_name,
      contact_email,
      contact_phone,
      address,
      latitude,
      longitude,
      website,
    } = req.body;
    const { role, userId } = req.user || {};

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        error: "Thiếu tên hoặc địa chỉ nông trại",
      });
    }

    const pool = await getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1️⃣ Insert farm
      const [result] = await conn.query(
        `INSERT INTO farms 
         (name, owner_name, contact_email, contact_phone, address, latitude, longitude, website, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          owner_name,
          contact_email,
          contact_phone,
          address,
          latitude || null,
          longitude || null,
          website || null,
          userId,
        ],
      );

      const farm_id = result.insertId;

      // 2️⃣ Upload file
      if (req.files && req.files.length > 0) {
        const fileRecords = req.files.map((f) => [
          "farm",
          farm_id,
          `/uploads/${f.filename}`,
          f.mimetype.startsWith("image") ? "image" : "document",
          f.originalname,
          userId,
        ]);

        await conn.query(
          `INSERT INTO media_files (entity_type, entity_id, file_url, file_type, caption, uploaded_by)
           VALUES ?`,
          [fileRecords],
        );
      }

      // // 3️⃣ Hash farm (blockchain optional)
      // const proof_hash = createFarmHash({ farm_id, name, address, owner_name });

      await conn.commit();

      return res.status(201).json({
        success: true,
        message: "✅ Tạo nông trại thành công",
        data: { farm_id, name, address },
      });
    } catch (err) {
      if (conn) await conn.rollback();
      console.error("❌ createFarm error:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi tạo nông trại",
      });
    } finally {
      if (conn) conn.release();
    }
  },

  /**
   * 📋 Lấy danh sách nông trại
   */
  searchFarms: async (req, res) => {
    const { role, userId } = req.user || {};
    const query = new FarmsQuery(req.body);

    try {
      const pool = await getPool();

      const offset = (query.pageIndex - 1) * query.pageSize;

      let baseQuery = `
        FROM farms
      `;

      const where = [`is_active = TRUE`];
      const params = [];

      // ---------- Role filter ----------
      if (role === "manufacturer") {
        where.push(`created_by = ?`);
        params.push(userId);
      }

      // ---------- Generic filter (filter chung giống C#) ----------
      if (query.filter) {
        where.push(`(
          name LIKE ? OR
          province LIKE ? OR
          district LIKE ? OR
          ward LIKE ?
        )`);
        params.push(
          `%${query.filter}%`,
          `%${query.filter}%`,
          `%${query.filter}%`,
          `%${query.filter}%`,
        );
      }

      // ---------- Field filters ----------
      if (query.farmName) {
        where.push(`name LIKE ?`);
        params.push(`%${query.farmName}%`);
      }

      if (query.province) {
        where.push(`province LIKE ?`);
        params.push(`%${query.province}%`);
      }

      if (query.district) {
        where.push(`district LIKE ?`);
        params.push(`%${query.district}%`);
      }

      if (query.ward) {
        where.push(`ward LIKE ?`);
        params.push(`%${query.ward}%`);
      }

      if (query.farmId) {
        where.push(`farm_id = ?`);
        params.push(query.farmId);
      }

      // Gộp WHERE
      if (where.length > 0) {
        baseQuery += " WHERE " + where.join(" AND ");
      }

      // ---------- COUNT ----------
      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total ${baseQuery}`,
        params,
      );
      const total = countRows[0].total;

      // ---------- SORT ----------
      const order = query.sortAscending ? "ASC" : "DESC";

      const dataQuery = `
        SELECT *
        ${baseQuery}
        ORDER BY ${query.sortColumn} ${order}
        LIMIT ? OFFSET ?
      `;

      const dataParams = [...params, query.pageSize, offset];
      const [rows] = await pool.query(dataQuery, dataParams);

      return res.status(200).json({
        success: true,
        pagination: {
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
        data: rows,
      });
    } catch (err) {
      console.error("searchFarms error:", err);
      return res.status(500).json({
        success: false,
        error: "Không lấy được danh sách nông trại",
      });
    }
  },

  /**
   * 🔍 Xem chi tiết nông trại
   */
  getFarmById: async (req, res) => {
    const { id } = req.params;
    const { role, userId } = req.user || {};

    try {
      const pool = await getPool();

      if (role === "manufacturer") {
        const [check] = await pool.query(
          `SELECT created_by FROM farms WHERE farm_id = ?`,
          [id],
        );
        if (!check.length) {
          return res
            .status(404)
            .json({ success: false, error: "Không tìm thấy nông trại" });
        }
        if (check[0].created_by !== userId) {
          return res.status(403).json({
            success: false,
            error: "Bạn không có quyền xem nông trại này",
          });
        }
      }

      const [rows] = await pool.query(
        `SELECT * FROM farms WHERE farm_id = ? AND is_active = TRUE`,
        [id],
      );

      if (!rows.length) {
        return res
          .status(404)
          .json({ success: false, error: "Không tìm thấy nông trại" });
      }

      return res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
      console.error("getFarmById error:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi lấy thông tin nông trại",
      });
    }
  },

  /**
   * 🗑️ Xóa (ẩn) nông trại — Soft Delete
   */
  deleteFarm: async (req, res) => {
    const { id } = req.params;
    const { role, userId } = req.user || {};

    const pool = await getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Kiểm tra tồn tại
      const [farms] = await conn.query(
        `SELECT farm_id, name, created_by, is_active 
         FROM farms WHERE farm_id = ?`,
        [id],
      );

      if (!farms.length) {
        return res.status(404).json({
          success: false,
          error: "Không tìm thấy nông trại",
        });
      }

      const farm = farms[0];

      // Kiểm tra quyền
      if (role === "manufacturer" && farm.created_by !== userId) {
        return res.status(403).json({
          success: false,
          error: "Bạn không có quyền xóa nông trại này",
        });
      }

      if (farm.is_active === 0) {
        return res.status(400).json({
          success: false,
          error: "Nông trại này đã bị vô hiệu hóa",
        });
      }

      // Soft delete
      await conn.query(
        `UPDATE farms 
         SET is_active = FALSE, updated_by = ?, updated_at = NOW()
         WHERE farm_id = ?`,
        [userId, id],
      );

      await conn.commit();

      return res.status(200).json({
        success: true,
        message: `🗑️ Đã vô hiệu hóa nông trại "${farm.name}"`,
      });
    } catch (err) {
      await conn.rollback();
      console.error("❌ deleteFarm error:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi vô hiệu hóa nông trại",
      });
    } finally {
      conn.release();
    }
  },
};

module.exports = farmController;
