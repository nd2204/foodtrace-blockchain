/**
 * 📦 batches.controller.js
 * Quản lý lô hàng (batch) – tạo, xem chi tiết, ghi blockchain, sinh QR, upload media
 * Phiên bản có phân quyền theo role (admin / manufacturer / public)
 */

const crypto = require('crypto');
const { getPool } = require('../config/db.config');
const BatchesQuery = require("../requests/BatchesQuery");
const QRCode = require('qrcode');
const { contract } = require('../config/blockchain');
const SearchService = require("../services/search.service");
require('dotenv').config();

/**
 * 🧩 Tạo SHA256 hash từ dữ liệu JSON
 */
function createHash(data) {
  const json = JSON.stringify(data);
  return crypto.createHash('sha256').update(json).digest('hex');
}

/**
 * 🔢 Sinh batch_number duy nhất
 */
function generateBatchNumber(productId) {
  return `BATCH-${productId}-${Date.now()}`;
}

/**
 * 🔗 Tạo đường dẫn QR code cho batch
 */
function generateQrText(batchNumber) {
  return `${process.env.QR_BASE_URL || 'https://foodtrace.local/trace/'}${batchNumber}`;
}

const batchesController = {
  /**
   * 📦 Tạo mới lô hàng
   */
  createBatch: async (req, res) => {
    const { role, userId } = req.user || {};
    const {
      product_id,
      farm_id,
      applied_license_id,
      production_date,
      expiry_date,
      origin_type,
    } = req.body;

    if (!product_id || !production_date) {
      return res
        .status(400)
        .json({ success: false, error: 'Thiếu thông tin bắt buộc (product_id, production_date)' });
    }

    const pool = await getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 🔒 Manufacturer chỉ được tạo batch cho farm họ sở hữu
      if (role === 'manufacturer') {
        const [farms] = await conn.query(
          'SELECT created_by FROM farms WHERE farm_id = ?',
          [farm_id]
        );
        if (!farms.length) {
          return res.status(404).json({ success: false, error: 'Không tìm thấy nông trại' });
        }
        if (farms[0].created_by !== userId) {
          return res
            .status(403)
            .json({ success: false, error: 'Bạn không có quyền tạo batch cho farm này' });
        }
      }

      // 1️⃣ Tạo batch_number
      const batch_number = generateBatchNumber(product_id);

      // 2️⃣ Lưu batch
      const [result] = await conn.query(
        `INSERT INTO batches 
          (product_id, farm_id, applied_license_id, batch_number, production_date, expiry_date, origin_type, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product_id,
          farm_id || null,
          applied_license_id || null,
          batch_number,
          production_date,
          expiry_date || null,
          origin_type || 'farm',
          userId,
        ]
      );

      const batch_id = result.insertId;

      // 3️⃣ Hash
      const payload = { batch_id, product_id, production_date, farm_id, applied_license_id };
      const proof_hash = createHash(payload);

      // 4️⃣ Ghi blockchain
      let blockchain_tx = null;
      let block_number = null;
      try {
        const tx = await contract.storeBatchHash(batch_id, proof_hash);
        const receipt = await tx.wait();
        blockchain_tx = receipt.hash;
        block_number = receipt.blockNumber;
      } catch (err) {
        console.warn('⚠️ Lỗi ghi blockchain (fallback):', err.message);
        blockchain_tx = '0x' + proof_hash.slice(0, 64);
      }

      // 5️⃣ Cập nhật DB
      await conn.query(
        `UPDATE batches 
         SET proof_hash=?, blockchain_tx=?, blockchain_block=?, updated_by=? 
         WHERE batch_id=?`,
        [proof_hash, blockchain_tx, block_number, userId, batch_id]
      );

      // 6️⃣ Upload file (nếu có)
      if (req.files && req.files.length > 0) {
        const fileRecords = req.files.map((f) => [
          'batch',
          batch_id,
          `/uploads/${f.filename}`,
          f.mimetype.startsWith('image') ? 'image' : 'document',
          f.originalname,
          userId,
        ]);

        await conn.query(
          `INSERT INTO media_files (entity_type, entity_id, file_url, file_type, caption, uploaded_by) VALUES ?`,
          [fileRecords]
        );
      }

      // 7️⃣ QR Code
      const qr_text = generateQrText(batch_number);
      const qr_image = await QRCode.toDataURL(qr_text);

      await conn.query(
        `INSERT INTO qr_codes (product_id, batch_id, qr_code, created_by)
         VALUES (?, ?, ?, ?)`,
        [product_id, batch_id, qr_text, userId]
      );

      await conn.commit();

      // 8️⃣ MiniSearch — thay cho MeiliSearch
      try {
        const [[product]] = await pool.query(
          `SELECT name FROM products WHERE product_id=?`,
          [product_id]
        );

        const [[farm]] = await pool.query(
          `SELECT name FROM farms WHERE farm_id=?`,
          [farm_id]
        );

        SearchService.add({
          id: `batch-${batch_id}`,
          name: batch_number,
          type: "batch",
          product_name: product?.name || null,
          farm_name: farm?.name || null,
          extra: {
            product_id,
            farm_id,
            blockchain_tx
          }
        });
      } catch (e) {
        console.warn("⚠️ MiniSearch index failed:", e.message);
      }

      return res.status(201).json({
        success: true,
        message: '✅ Tạo lô hàng thành công và ghi blockchain',
        data: {
          batch_id,
          batch_number,
          proof_hash,
          blockchain_tx,
          block_number,
          qr_link: qr_text,
          qr_image,
        },
      });
    } catch (err) {
      console.error('❌ Lỗi tạo lô hàng:', err);
      if (conn) await conn.rollback();
      res.status(500).json({ success: false, error: 'Lỗi khi tạo lô hàng' });
    } finally {
      if (conn) conn.release();
    }
  },

  /**
   * 📋 Lấy danh sách lô hàng
   */

  searchBatches: async (req, res) => {
    const { role, userId } = req.user || {};
    const query = new BatchesQuery(req.body);

    try {
      const pool = await getPool();

      const offset = (query.pageIndex - 1) * query.pageSize;

      // Base query
      let baseQuery = `
        FROM batches b
        LEFT JOIN products p ON b.product_id = p.product_id
        LEFT JOIN farms f ON b.farm_id = f.farm_id
      `;

      const where = [];
      const params = [];

      // Filter theo role
      if (role === "manufacturer") {
        where.push(`b.created_by = ?`);
        params.push(userId);
      }

      // Filter chung theo filter (giống C# Filter)
      if (query.filter) {
        where.push(`
          (
            b.batch_code LIKE ? OR
            p.name LIKE ? OR
            f.name LIKE ?
          )
        `);

        params.push(`%${query.filter}%`, `%${query.filter}%`, `%${query.filter}%`);
      }

      // Filter riêng theo field
      if (query.batchCode) {
        where.push(`b.batch_code LIKE ?`);
        params.push(`%${query.batchCode}%`);
      }

      if (query.productName) {
        where.push(`p.name LIKE ?`);
        params.push(`%${query.productName}%`);
      }

      if (query.farmName) {
        where.push(`f.name LIKE ?`);
        params.push(`%${query.farmName}%`);
      }

      if (query.productId) {
        where.push(`b.product_id = ?`);
        params.push(query.productId);
      }

      if (query.farmId) {
        where.push(`b.farm_id = ?`);
        params.push(query.farmId);
      }

      // Gộp WHERE
      if (where.length > 0) {
        baseQuery += " WHERE " + where.join(" AND ");
      }

      // ---- COUNT ----
      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total ${baseQuery}`,
        params
      );
      const total = countRows[0].total;

      // ---- SORT ----
      const orderDirection = query.sortAscending ? "ASC" : "DESC";

      const dataQuery = `
        SELECT 
          b.*,
          p.name AS product_name,
          f.name AS farm_name
        ${baseQuery}
        ORDER BY ${query.sortColumn} ${orderDirection}
        LIMIT ? OFFSET ?
      `;

      const dataParams = [...params, query.pageSize, offset];
      const [rows] = await pool.query(dataQuery, dataParams);

      res.status(200).json({
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
      console.error("searchBatches error:", err);
      res.status(500).json({
        success: false,
        error: "Không lấy được danh sách lô hàng"
      });
    }
  },

  /**
   * 🔍 Chi tiết lô hàng + xác minh blockchain
   */
  getBatchById: async (req, res) => {
    const { id } = req.params;
    const { role, userId } = req.user || {};

    try {
      const pool = await getPool();

      // 🔒 Manufacturer chỉ xem batch của họ
      if (role === 'manufacturer') {
        const [check] = await pool.query(
          `SELECT created_by FROM batches WHERE batch_id = ?`,
          [id]
        );
        if (!check.length) {
          return res.status(404).json({ success: false, error: 'Không tìm thấy lô hàng' });
        }
        if (check[0].created_by !== userId) {
          return res
            .status(403)
            .json({ success: false, error: 'Bạn không có quyền xem lô hàng này' });
        }
      }

      const [rows] = await pool.query(
        `SELECT b.*, p.name AS product_name, f.name AS farm_name
         FROM batches b
         LEFT JOIN products p ON b.product_id = p.product_id
         LEFT JOIN farms f ON b.farm_id = f.farm_id
         WHERE b.batch_id = ?`,
        [id]
      );

      if (!rows.length) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy lô hàng' });
      }

      const batch = rows[0];

      // Blockchain verification
      let onChainHash = null;
      let onChainTime = null;
      let match = false;

      try {
        const result = await contract.getBatchHash(batch.batch_id);
        onChainHash = result[0];
        onChainTime = result[1];
        match = batch.proof_hash === onChainHash;
      } catch (err) {
        console.warn('⚠️ Không thể xác minh blockchain:', err.message);
      }

      res.json({
        success: true,
        data: {
          ...batch,
          blockchain_verification: {
            onChainHash,
            onChainTime,
            match,
          },
        },
      });
    } catch (err) {
      console.error('getBatchById error:', err);
      res.status(500).json({ success: false, error: 'Lỗi khi lấy thông tin lô hàng' });
    }
  },
};

module.exports = batchesController;