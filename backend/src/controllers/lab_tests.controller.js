/**
 * 🔬 lab_tests.controller.js
 * CRUD kết quả kiểm định chất lượng (Lab Tests)
 * Phiên bản chuẩn hóa: phân quyền, upload file, blockchain + MiniSearch
 */

const { getPool } = require("../config/db.config");
const crypto = require("crypto");
const { contract } = require("../config/blockchain");
const SearchService = require("../services/search.service"); // ✅ MiniSearch
const LabTestsQuery = require("../requests/LabTestsQuery");
/**
 * 🧩 Tạo hash kiểm định để xác thực
 */
function createLabHash(test) {
  const json = JSON.stringify(test);
  return crypto.createHash("sha256").update(json).digest("hex");
}

const labTestController = {
  /**
   * 🧪 Tạo kết quả kiểm định
   */
  createLabTest: async (req, res) => {
    const { batch_id, test_type, result, tested_by, test_date } = req.body;
    const { role, userId } = req.user || {};

    if (!batch_id || !test_type) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin bắt buộc (batch_id, test_type)",
      });
    }

    const pool = await getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 🔒 Manufacturer chỉ tạo test cho batch họ sở hữu
      if (role === "manufacturer") {
        const [batchCheck] = await conn.query(
          `SELECT created_by FROM batches WHERE batch_id = ?`,
          [batch_id]
        );
        if (!batchCheck.length) {
          return res.status(404).json({ success: false, error: "Không tìm thấy batch" });
        }
        if (batchCheck[0].created_by !== userId) {
          return res.status(403).json({
            success: false,
            error: "Không có quyền thêm kiểm định cho batch này",
          });
        }
      }

      // 1️⃣ Thêm lab test
      const [resultInsert] = await conn.query(
        `INSERT INTO lab_tests (batch_id, test_type, result, tested_by, test_date, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [batch_id, test_type, result || null, tested_by || null, test_date || null, userId]
      );

      const test_id = resultInsert.insertId;

      // 2️⃣ Upload file chứng nhận
      if (req.files && req.files.length > 0) {
        const fileRecords = req.files.map((f) => [
          "lab_test",
          test_id,
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

      // 3️⃣ Tạo hash kiểm định
      const proof_hash = createLabHash({
        test_id,
        batch_id,
        test_type,
        result,
        tested_by,
      });

      // 4️⃣ Ghi blockchain
      let blockchain_tx = null;
      let block_number = null;

      try {
        const tx = await contract.storeBatchHash(test_id, proof_hash);
        const receipt = await tx.wait();
        blockchain_tx = receipt.hash;
        block_number = receipt.blockNumber;
      } catch (err) {
        console.warn("⚠️ Ghi blockchain thất bại:", err.message);
        blockchain_tx = "0x" + proof_hash.slice(0, 64);
      }

      // 5️⃣ Lưu TX/hash vào DB
      await conn.query(
        `UPDATE lab_tests
         SET proof_hash=?, blockchain_tx=?, blockchain_block=?, updated_by=?
         WHERE test_id=?`,
        [proof_hash, blockchain_tx, block_number, userId, test_id]
      );

      await conn.commit();

      // 6️⃣ 🔍 Index vào MiniSearch
      try {
        const [[batch]] = await pool.query(
          `SELECT batch_number, product_id FROM batches WHERE batch_id=?`,
          [batch_id]
        );

        SearchService.add({
          id: `lab-${test_id}`,
          name: test_type,
          type: "lab_test",
          category: batch?.batch_number || "",
          address: tested_by || "",
          extra: {
            batch_id,
            batch_number: batch?.batch_number,
            result,
            tested_by,
          },
        });
      } catch (err) {
        console.warn("⚠️ MiniSearch index lab_test error:", err.message);
      }

      res.status(201).json({
        success: true,
        message: "✅ Thêm kiểm định thành công và ghi blockchain",
        data: { test_id, batch_id, test_type, blockchain_tx },
      });
    } catch (err) {
      await conn.rollback();
      console.error("❌ createLabTest error:", err);
      res.status(500).json({ success: false, error: "Lỗi khi thêm kiểm định" });
    } finally {
      conn.release();
    }
  },

  /**
   * 📋 Lấy danh sách kiểm định
   */
  searchLabTests: async (req, res) => {
  const { role, userId } = req.user || {};
  const query = new LabTestsQuery(req.body);

  try {
    const pool = await getPool();

    const offset = (query.pageIndex - 1) * query.pageSize;

    let baseQuery = `
      FROM lab_tests lt
      LEFT JOIN batches b ON lt.batch_id = b.batch_id
    `;

    const where = [];
    const params = [];

    // Always filter by user role
    if (role === "manufacturer") {
      where.push(`b.created_by = ?`);
      params.push(userId);
    }

    // Generic filter (search chung giống C#)
    if (query.filter) {
      where.push(`
        (
          lt.test_code LIKE ? OR
          b.batch_number LIKE ? OR
          lt.result LIKE ?
        )
      `);
      params.push(
        `%${query.filter}%`,
        `%${query.filter}%`,
        `%${query.filter}%`
      );
    }

    // Field filters
    if (query.testCode) {
      where.push(`lt.test_code LIKE ?`);
      params.push(`%${query.testCode}%`);
    }

    if (query.batchNumber) {
      where.push(`b.batch_number LIKE ?`);
      params.push(`%${query.batchNumber}%`);
    }

    if (query.batchId) {
      where.push(`lt.batch_id = ?`);
      params.push(query.batchId);
    }

    if (query.result) {
      where.push(`lt.result LIKE ?`);
      params.push(`%${query.result}%`);
    }

    // Date filters
    if (query.fromDate) {
      where.push(`lt.test_date >= ?`);
      params.push(query.fromDate);
    }

    if (query.toDate) {
      where.push(`lt.test_date <= ?`);
      params.push(query.toDate);
    }

    // Apply WHERE
    if (where.length > 0) {
      baseQuery += " WHERE " + where.join(" AND ");
    }

    // Count
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total ${baseQuery}`,
      params
    );
    const total = countRows[0].total;

    // Sort
    const order = query.sortAscending ? "ASC" : "DESC";

    const dataQuery = `
      SELECT 
        lt.*,
        b.batch_number,
        b.created_by AS batch_owner
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
    console.error("searchLabTests error:", err);
    return res.status(500).json({
      success: false,
      error: "Không lấy được danh sách kiểm định",
    });
  }
},

  /**
   * 🔍 Lấy kiểm định theo batch
   */
  getTestsByBatch: async (req, res) => {
    const { batch_id } = req.params;
    const { role, userId } = req.user || {};

    try {
      const pool = await getPool();

      // Manufacturer phải đúng batch của mình
      if (role === "manufacturer") {
        const [owner] = await pool.query(
          `SELECT created_by FROM batches WHERE batch_id = ?`,
          [batch_id]
        );

        if (!owner.length) {
          return res.status(404).json({ success: false, error: "Không tìm thấy batch" });
        }

        if (owner[0].created_by !== userId) {
          return res.status(403).json({
            success: false,
            error: "Không có quyền xem kiểm định batch này",
          });
        }
      }

      const [rows] = await pool.query(
        `SELECT * FROM lab_tests WHERE batch_id=? ORDER BY test_date DESC`,
        [batch_id]
      );

      res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error("getTestsByBatch error:", err);
      res.status(500).json({ success: false, error: "Không lấy được kiểm định cho batch" });
    }
  },
};

module.exports = labTestController;
