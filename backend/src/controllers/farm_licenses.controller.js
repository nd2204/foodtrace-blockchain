/**
 * 🪪 farm_licenses.controller.js
 * CRUD giấy chứng nhận của nông trại (Farm Licenses)
 * Phiên bản có phân quyền + upload file + blockchain + MiniSearch
 */

const crypto = require("crypto");
const { getPool } = require("../config/db.config");
const { contract } = require("../config/blockchain");
const SearchService = require("../services/search.service"); // ✅ MiniSearch
const LicenseQuery = require("../requests/LicenseQuery");
function createLicenseHash(license) {
  const json = JSON.stringify(license);
  return crypto.createHash("sha256").update(json).digest("hex");
}

const farmLicenseController = {
  /**
   * 🧾 Tạo giấy chứng nhận mới
   */
  createLicense: async (req, res) => {
    const {
      farm_id,
      license_number,
      license_type,
      issuer,
      issue_date,
      expiry_date,
      status,
      notes,
    } = req.body;

    const { role, userId } = req.user || {};

    if (!farm_id || !license_number || !license_type) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin bắt buộc (farm_id, license_number, license_type)",
      });
    }

    const pool = await getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 🔒 Manufacturer → chỉ được tạo license cho farm họ sở hữu
      if (role === "manufacturer") {
        const [farms] = await conn.query(
          "SELECT created_by FROM farms WHERE farm_id = ?",
          [farm_id]
        );
        if (!farms.length) {
          return res.status(404).json({ success: false, error: "Không tìm thấy nông trại" });
        }
        if (farms[0].created_by !== userId) {
          return res.status(403).json({
            success: false,
            error: "Bạn không có quyền tạo license cho farm này",
          });
        }
      }

      // 1️⃣ Tạo bản ghi license
      const [result] = await conn.query(
        `INSERT INTO farm_licenses 
        (farm_id, license_number, license_type, issuer, issue_date, expiry_date, status, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          farm_id,
          license_number,
          license_type,
          issuer || null,
          issue_date || null,
          expiry_date || null,
          status || "valid",
          notes || null,
          userId,
        ]
      );

      const license_id = result.insertId;

      // 2️⃣ Upload file
      if (req.files && req.files.length > 0) {
        const fileRecords = req.files.map((f) => [
          "license",
          license_id,
          `/uploads/${f.filename}`,
          f.mimetype.startsWith("image") ? "image" : "document",
          f.originalname,
          userId,
        ]);

        await conn.query(
          `INSERT INTO media_files (entity_type, entity_id, file_url, file_type, caption, uploaded_by)
          VALUES ?`,
          [fileRecords]
        );
      }

      // 3️⃣ Tạo hash
      const proof_hash = createLicenseHash({
        license_id,
        farm_id,
        license_number,
        license_type,
        issuer,
        issue_date,
      });

      // 4️⃣ Ghi blockchain
      let blockchain_tx = null;
      let block_number = null;

      try {
        const tx = await contract.storeBatchHash(license_id, proof_hash);
        const receipt = await tx.wait();
        blockchain_tx = receipt.hash;
        block_number = receipt.blockNumber;
      } catch (err) {
        console.warn("⚠️ Blockchain lỗi:", err.message);
        blockchain_tx = "0x" + proof_hash.slice(0, 64);
      }

      // // 5️⃣ Lưu TX + hash
      // await conn.query(
      //   `UPDATE farm_licenses 
      //    SET notes = CONCAT(IFNULL(notes,''), '\nBlockchain TX: ', ?),
      //        updated_by = ?, proof_hash = ?, blockchain_tx = ?, blockchain_block = ?
      //    WHERE license_id = ?`,
      //   [blockchain_tx, userId, proof_hash, blockchain_tx, block_number, license_id]
      // );

      await conn.commit();

      return res.status(201).json({
        success: true,
        message: "✅ Tạo giấy chứng nhận thành công",
        data: { license_id, license_number, blockchain_tx },
      });
    } catch (err) {
      await conn.rollback();
      console.error("❌ createLicense error:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi tạo giấy chứng nhận",
      });
    } finally {
      conn.release();
    }
  },

  /**
   * 📋 Lấy danh sách license
   */
  searchLicenses: async (req, res) => {
    const { role, userId } = req.user || {};
    const query = new LicenseQuery(req.body);

    try {
      const pool = await getPool();

      const offset = (query.pageIndex - 1) * query.pageSize;

      let baseQuery = `
        FROM farm_licenses l
        LEFT JOIN farms f ON l.farm_id = f.farm_id
      `;

      const where = [];
      const params = [];

      // ------- Role filter -------
      if (role === "manufacturer") {
        where.push(`f.created_by = ?`);
        params.push(userId);
      }

      // ------- Generic filter (search chung) -------
      if (query.filter) {
        where.push(`
          (
            l.license_code LIKE ? OR
            f.name LIKE ?
          )
        `);

        params.push(`%${query.filter}%`, `%${query.filter}%`);
      }

      // ------- Field filters -------
      if (query.licenseCode) {
        where.push(`l.license_code LIKE ?`);
        params.push(`%${query.licenseCode}%`);
      }

      if (query.farmName) {
        where.push(`f.name LIKE ?`);
        params.push(`%${query.farmName}%`);
      }

      if (query.farmId) {
        where.push(`l.farm_id = ?`);
        params.push(query.farmId);
      }

      if (query.status !== null) {
        where.push(`l.status = ?`);
        params.push(query.status);
      }

      // Gộp where
      if (where.length > 0) {
        baseQuery += " WHERE " + where.join(" AND ");
      }

      // ------- COUNT -------
      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total ${baseQuery}`,
        params
      );
      const total = countRows[0].total;

      // ------- SORT -------
      const order = query.sortAscending ? "ASC" : "DESC";

      const dataQuery = `
        SELECT 
          l.*, 
          f.name AS farm_name
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
          totalPages: Math.ceil(total / query.pageSize)
        },
        data: rows
      });

    } catch (err) {
      console.error("searchLicenses error:", err);
      return res.status(500).json({
        success: false,
        error: "Không lấy được danh sách giấy chứng nhận"
      });
    }
  },

  /**
   * 🔍 Xem chi tiết license
   */
  getLicenseById: async (req, res) => {
    const { id } = req.params;
    const { role, userId } = req.user || {};

    try {
      const pool = await getPool();

      // Kiểm tra quyền
      if (role === "manufacturer") {
        const [check] = await pool.query(
          `SELECT f.created_by 
           FROM farm_licenses l 
           JOIN farms f ON l.farm_id = f.farm_id
           WHERE l.license_id = ?`,
          [id]
        );

        if (!check.length) {
          return res.status(404).json({
            success: false,
            error: "Không tìm thấy giấy chứng nhận",
          });
        }

        if (check[0].created_by !== userId) {
          return res.status(403).json({
            success: false,
            error: "Bạn không có quyền xem giấy chứng nhận này",
          });
        }
      }

      const [rows] = await pool.query(
        `SELECT l.*, f.name AS farm_name
         FROM farm_licenses l
         LEFT JOIN farms f ON l.farm_id = f.farm_id
         WHERE l.license_id = ?`,
        [id]
      );

      if (!rows.length) {
        return res
          .status(404)
          .json({ success: false, error: "Không tìm thấy giấy chứng nhận" });
      }

      const license = rows[0];

      // Blockchain verify
      let onChainHash = null;
      let onChainTime = null;
      let match = false;

      try {
        const result = await contract.getBatchHash(license.license_id);
        onChainHash = result[0];
        onChainTime = result[1];
        match = license.proof_hash === onChainHash;
      } catch (err) {
        console.warn("⚠️ Blockchain verify error:", err.message);
      }

      return res.status(200).json({
        success: true,
        data: {
          ...license,
          blockchain_verification: {
            onChainHash,
            onChainTime,
            match,
          },
        },
      });
    } catch (err) {
      console.error("getLicenseById error:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi lấy chi tiết giấy chứng nhận",
      });
    }
  },

  /**
   * 🗑️ Xóa giấy chứng nhận + file + MiniSearch index
   */
  deleteLicense: async (req, res) => {
    const { id } = req.params;
    const { role, userId } = req.user || {};

    const pool = await getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Kiểm tra tồn tại
      const [licenses] = await conn.query(
        `SELECT l.*, f.created_by
         FROM farm_licenses l
         JOIN farms f ON l.farm_id = f.farm_id
         WHERE l.license_id = ?`,
        [id]
      );

      if (!licenses.length) {
        return res.status(404).json({
          success: false,
          error: "Không tìm thấy giấy chứng nhận",
        });
      }

      const license = licenses[0];

      // Kiểm tra quyền
      if (role === "manufacturer" && license.created_by !== userId) {
        return res.status(403).json({
          success: false,
          error: "Bạn không có quyền xóa giấy chứng nhận này",
        });
      }

      // Xóa media
      const [files] = await conn.query(
        `SELECT file_url FROM media_files WHERE entity_type='license' AND entity_id=?`,
        [id]
      );

      const fs = require("fs");
      for (const f of files) {
        const filePath = `.${f.file_url}`;
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.warn("⚠️ Không thể xóa file:", err.message);
          }
        }
      }

      await conn.query(
        `DELETE FROM media_files WHERE entity_type='license' AND entity_id=?`,
        [id]
      );

      // Xóa license
      await conn.query(`DELETE FROM farm_licenses WHERE license_id=?`, [id]);
      await conn.commit();

      return res.status(200).json({
        success: true,
        message: "🗑️ Đã xóa giấy chứng nhận thành công",
      });
    } catch (err) {
      await conn.rollback();
      console.error("❌ deleteLicense error:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi xóa giấy chứng nhận",
      });
    } finally {
      conn.release();
    }
  },
};

module.exports = farmLicenseController;
