/**
 * 📦 product.model.js
 * Model thao tác dữ liệu sản phẩm (Products)
 * Theo chuẩn dự án FoodTrace Blockchain
 */

const { getPool } = require("../config/db.config");

const ProductModel = {
  /**
   * 🧾 Lấy toàn bộ sản phẩm (Admin xem tất cả, Manufacturer lọc theo created_by)
   */
  async getAll(role, userId) {
    const pool = await getPool();

    let query = `
      SELECT 
        p.product_id,
        p.name,
        p.description,
        p.manufacturer,
        p.origin,
        p.category_id,
        c.name AS category_name,
        p.status,
        p.blockchain_id,
        p.is_active,
        p.created_by,
        p.updated_by,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (role === "manufacturer") {
      query += " AND p.created_by = ?";
      params.push(userId);
    }

    query += " ORDER BY p.created_at DESC";

    const [rows] = await pool.query(query, params);
    return rows;
  },

  /**
   * 🆕 Tạo sản phẩm mới
   */
  async create({
    name,
    description,
    manufacturer,
    origin,
    category_id,
    blockchain_id,
    status,
    created_by,
  }) {
    const pool = await getPool();

    const [result] = await pool.query(
      `
      INSERT INTO products (
        name,
        description,
        manufacturer,
        origin,
        category_id,
        blockchain_id,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        description || null,
        manufacturer || null,
        origin || null,
        category_id || null,
        blockchain_id || null,
        status || "active",
        created_by || null,
      ]
    );

    return result.insertId;
  },

  /**
   * ✏️ Cập nhật thông tin sản phẩm
   */
  async update(product_id, data) {
    const pool = await getPool();

    const fields = [];
    const values = [];

    for (const key in data) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }

    if (!fields.length) return false;

    fields.push("updated_at = NOW()");
    values.push(product_id);

    await pool.query(
      `UPDATE products SET ${fields.join(", ")} WHERE product_id = ?`,
      values
    );

    return true;
  },

  /**
   * 🔍 Lấy chi tiết 1 sản phẩm theo ID
   */
  async getById(product_id, role, userId) {
    const pool = await getPool();

    let query = `
      SELECT 
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.product_id = ? AND p.is_active = TRUE
    `;
    const params = [product_id];

    if (role === "manufacturer") {
      query += " AND p.created_by = ?";
      params.push(userId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  },

  /**
   * 🗑️ Xóa mềm sản phẩm (Soft Delete)
   */
  async softDelete(product_id, userId) {
    const pool = await getPool();
    await pool.query(
      `
      UPDATE products 
      SET is_active = FALSE, updated_by = ?, updated_at = NOW()
      WHERE product_id = ?
      `,
      [userId, product_id]
    );
    return true;
  },
};

module.exports = ProductModel;
