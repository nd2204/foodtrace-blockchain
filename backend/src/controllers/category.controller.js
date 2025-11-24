/**
 * 🗂️ category.controller.js
 * Quản lý danh mục sản phẩm (Admin only)
 */

const { getPool } = require('../config/db.config');
const CategoriesQuery = require('../requests/CategoriesQuery');
const categoryController = {
  // 🧩 Lấy danh sách danh mục
  searchCategories: async (req, res) => {
    const query = new CategoriesQuery(req.body);

    try {
      const pool = await getPool();

      const offset = (query.pageIndex - 1) * query.pageSize;

      let baseQuery = `FROM categories`;
      const where = [];
      const params = [];

      // Filter chung nếu bạn muốn sử dụng `filter`
      if (query.filter) {
        where.push(`(name LIKE ? OR description LIKE ?)`);
        params.push(`%${query.filter}%`, `%${query.filter}%`);
      }

      // Filter theo field riêng
      if (query.name) {
        where.push(`name LIKE ?`);
        params.push(`%${query.name}%`);
      }

      if (query.description) {
        where.push(`description LIKE ?`);
        params.push(`%${query.description}%`);
      }

      // Gộp WHERE
      if (where.length > 0) {
        baseQuery += " WHERE " + where.join(" AND ");
      }

      // --- COUNT ---
      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total ${baseQuery}`,
        params
      );

      const total = countRows[0].total;

      // --- SORT ---
      const orderDirection = query.sortAscending ? "ASC" : "DESC";

      const dataQuery = `
        SELECT category_id, name, description
        ${baseQuery}
        ORDER BY ${query.sortColumn} ${orderDirection}
        LIMIT ? OFFSET ?
      `;

      const dataParams = [...params, query.pageSize, offset];
      const [rows] = await pool.query(dataQuery, dataParams);

      res.json({
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
      console.error("searchCategories error:", err);
      res.status(500).json({ success: false, error: "Không lấy được danh mục" });
    }
  },
  getAllCategories: async (req, res) => { 
    try { 
      const pool = await getPool(); 
      const [rows] = await pool.query( "SELECT category_id, name, description FROM categories ORDER BY name ASC" ); 
      res.status(200).json({ success: true, data: rows }); 
    }
       catch (err) 
       { console.error('getAllCategories error:', err); 
        res.status(500).json({ success: false, error: 'Không lấy được danh mục' }); 
      } 
    },
  // ➕ Tạo danh mục (Admin only)
  createCategory: async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user?.userId;

    if (!name) return res.status(400).json({ success: false, error: 'Tên danh mục bắt buộc' });

    const pool = await getPool();

    try {
      const [result] = await pool.query(
        `INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)`,
        [name, description || null, userId]
      );
      res.status(201).json({
        success: true,
        message: 'Thêm danh mục thành công',
        data: { category_id: result.insertId, name },
      });
    } catch (err) {
      console.error('createCategory error:', err);
      res.status(500).json({ success: false, error: 'Lỗi khi thêm danh mục' });
    }
  },
  
  // ✏️ Cập nhật danh mục
  updateCategory: async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.userId;
    const pool = await getPool();

    try {
      await pool.query(
        `UPDATE categories SET name=?, description=?, updated_by=? WHERE category_id=?`,
        [name, description, userId, id]
      );
      res.json({ success: true, message: 'Cập nhật danh mục thành công' });
    } catch (err) {
      console.error('updateCategory error:', err);
      res.status(500).json({ success: false, error: 'Lỗi khi cập nhật danh mục' });
    }
  },

  // 🗑️ Xóa danh mục
  deleteCategory: async (req, res) => {
    const { id } = req.params;
    const pool = await getPool();

    try {
      await pool.query(`DELETE FROM categories WHERE category_id=?`, [id]);
      res.json({ success: true, message: 'Đã xóa danh mục' });
    } catch (err) {
      console.error('deleteCategory error:', err);
      res.status(500).json({ success: false, error: 'Lỗi khi xóa danh mục' });
    }
  },
};

module.exports = categoryController;
