/**
 * 🧭 trace.controller.js
 * Truy xuất nguồn gốc nông sản – tách API "tóm tắt" & "chi tiết"
 */

const { getPool } = require('../config/db.config');
const { contract } = require('../config/blockchain');

const traceController = {
  /**
   * 🧾 API 1 – Truy xuất tóm tắt: batch + sản phẩm + lab test cơ bản
   */
  traceByBatchNumber: async (req, res) => {
    const { batch_number } = req.params;
    if (!batch_number)
      return res.status(400).json({ success: false, error: 'Thiếu batch_number' });

    const pool = await getPool();

    try {
      // 1️⃣ Lấy batch + product
      const [rows] = await pool.query(
        `
        SELECT 
          b.batch_id, b.batch_number, b.production_date, b.expiry_date,
          b.proof_hash, b.blockchain_tx, b.blockchain_block,
          p.name AS product_name, p.description AS product_description
        FROM batches b
        LEFT JOIN products p ON b.product_id = p.product_id
        WHERE b.batch_number = ?
      `,
        [batch_number]
      );

      if (!rows.length)
        return res.status(404).json({ success: false, error: 'Không tìm thấy lô hàng' });

      const batch = rows[0];

      // 2️⃣ Lấy kiểm nghiệm (lab test)
      const [labTests] = await pool.query(
        `
        SELECT test_type, result, test_date, tested_by
        FROM lab_tests
        WHERE batch_id = ?
        ORDER BY test_date DESC
      `,
        [batch.batch_id]
      );

      // 3️⃣ Ghi log quét QR (nếu có)
      try {
        const { user } = req;
        const userId = user?.userId || null;
        const device_info = req.headers['user-agent'] || 'Unknown device';
        const location = req.query.location || 'Unknown';

        await pool.query(
          `INSERT INTO scan_logs (user_id, qr_id, device_info, location)
           VALUES (?, ?, ?, ?)`,
          [userId, batch.batch_id, device_info, location]
        );
      } catch (logErr) {
        console.warn('⚠️ Không thể ghi log QR scan:', logErr.message);
      }

      // ✅ Trả về dữ liệu gọn (chỉ phần cần hiển thị ban đầu)
      res.status(200).json({
        success: true,
        data: {
          batch: {
            batch_id: batch.batch_id,
            batch_number: batch.batch_number,
            production_date: batch.production_date,
            expiry_date: batch.expiry_date,
            proof_hash: batch.proof_hash,
          },
          product: {
            name: batch.product_name,
            description: batch.product_description,
          },
          lab_tests: labTests,
        },
      });
    } catch (err) {
      console.error('❌ traceByBatchNumber error:', err);
      res.status(500).json({ success: false, error: 'Lỗi khi truy xuất nguồn gốc' });
    }
  },

  /**
   * 🔍 API 2 – Lấy chi tiết mở rộng (farm, license, media, blockchain)
   */
  getTraceDetails: async (req, res) => {
    const { batch_number } = req.params;
    if (!batch_number)
      return res.status(400).json({ success: false, error: 'Thiếu batch_number' });

    const pool = await getPool();

    try {
      // Lấy thông tin cơ bản để xác định batch_id, farm_id, v.v.
      const [batches] = await pool.query(
        `
        SELECT b.batch_id, b.farm_id, b.applied_license_id, b.proof_hash, b.blockchain_tx, b.blockchain_block
        FROM batches b
        WHERE b.batch_number = ?
      `,
        [batch_number]
      );

      if (!batches.length)
        return res.status(404).json({ success: false, error: 'Không tìm thấy lô hàng' });

      const batch = batches[0];

      // 🧩 Thông tin farm + license
      const [farmRows] = await pool.query(
        `
        SELECT f.name AS farm_name, f.address, f.latitude, f.longitude,
               l.license_type, l.license_number, l.expiry_date
        FROM farms f
        LEFT JOIN farm_licenses l ON l.license_id = ?
        WHERE f.farm_id = ?
      `,
        [batch.applied_license_id, batch.farm_id]
      );

      // 🧩 Media files
      const [mediaFiles] = await pool.query(
        `
        SELECT file_url, file_type, caption
        FROM media_files
        WHERE (entity_type = 'farm' AND entity_id = ?) 
           OR (entity_type = 'batch' AND entity_id = ?)
        ORDER BY created_at DESC
      `,
        [batch.farm_id, batch.batch_id]
      );

      // 🧩 Blockchain xác minh
      let onChainHash = null;
      let onChainTime = null;
      let verified = false;

      try {
        const result = await contract.getBatchHash(batch.batch_id);
        onChainHash = result[0];
        onChainTime = result[1];
        verified = batch.proof_hash === onChainHash;
      } catch (err) {
        console.warn('⚠️ Blockchain không khả dụng:', err.message);
      }

      res.status(200).json({
        success: true,
        data: {
          farm: farmRows[0] || null,
          media_files: mediaFiles,
          blockchain: {
            verified,
            onChainHash,
            onChainTime,
            blockchain_tx: batch.blockchain_tx,
            blockchain_block: batch.blockchain_block,
          },
        },
      });
    } catch (err) {
      console.error('❌ getTraceDetails error:', err);
      res.status(500).json({ success: false, error: 'Lỗi khi lấy chi tiết truy xuất' });
    }
  },
};

module.exports = traceController;
