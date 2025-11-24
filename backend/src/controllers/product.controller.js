/**
 * 🛍️ products.controller.js
 * Quản lý sản phẩm – chuẩn hoá theo kiến trúc QueryModel + MiniSearch + Audit
 */

const { getPool } = require("../config/db.config");
const productModel = require("../models/product.model");
const ProductsQuery = require("../requests/ProductsQuery");
const ProductsPublicQuery = require("../requests/ProductsPublicQuery");
const SearchService = require("../services/search.service"); // MiniSearch index

const productsController = {

  /**
   * 🔍 Tìm kiếm sản phẩm (Admin – có phân quyền)
   */
  searchProducts: async (req, res) => {
    const query = new ProductsQuery(req.body);
    const { role, userId } = req.user || {};

    try {
      const pool = await getPool();
      const offset = (query.pageIndex - 1) * query.pageSize;

      let baseQuery = `
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE 1 = 1
      `;

      const where = [];
      const params = [];

      // 🔒 Manufacturer chỉ xem sản phẩm do mình tạo
      if (role === "manufacturer") {
        where.push(`p.created_by = ?`);
        params.push(userId);
      }

      // Generic filter
      if (query.filter) {
        where.push(`
          (
            p.name LIKE ? OR
            p.description LIKE ? OR
            p.origin LIKE ? OR
            c.name LIKE ?
          )
        `);
        params.push(
          `%${query.filter}%`,
          `%${query.filter}%`,
          `%${query.filter}%`,
          `%${query.filter}%`
        );
      }

      // Field filters
      if (query.name) {
        where.push(`p.name LIKE ?`);
        params.push(`%${query.name}%`);
      }

      if (query.description) {
        where.push(`p.description LIKE ?`);
        params.push(`%${query.description}%`);
      }

      if (query.origin) {
        where.push(`p.origin LIKE ?`);
        params.push(`%${query.origin}%`);
      }

      if (query.categoryId) {
        where.push(`p.category_id = ?`);
        params.push(query.categoryId);
      }

      if (query.status) {
        where.push(`p.status = ?`);
        params.push(query.status);
      }

      // Apply WHERE
      if (where.length > 0) {
        baseQuery += " AND " + where.join(" AND ");
      }

      // COUNT
      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total ${baseQuery}`,
        params
      );
      const total = countRows[0].total;

      // SORT
      const order = query.sortAscending ? "ASC" : "DESC";

      // QUERY DATA
      const dataQuery = `
        SELECT 
          p.product_id,
          p.name,
          p.description,
          p.origin,
          p.status,
          c.name AS category_name,
          p.created_at, 
          p.updated_at
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
      console.error("searchProducts error:", err);
      res.status(500).json({ success: false, error: "Lỗi máy chủ" });
    }
  },

  /**
   * 🌐 Search sản phẩm public (frontend AI suggestion)
   */
  searchProductsPublic: async (req, res) => {
    const query = new ProductsPublicQuery(req.body);

    try {
      const pool = await getPool();
      const offset = (query.pageIndex - 1) * query.pageSize;

      let baseQuery = `
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.status = 'active'
      `;

      const where = [];
      const params = [];

      // Generic filter
      if (query.filter) {
        where.push(`
          (
            p.name LIKE ? OR
            p.description LIKE ? OR
            p.origin LIKE ? OR
            c.name LIKE ?
          )
        `);
        params.push(
          `%${query.filter}%`,
          `%${query.filter}%`,
          `%${query.filter}%`,
          `%${query.filter}%`
        );
      }

      // Field filters
      if (query.name) {
        where.push(`p.name LIKE ?`);
        params.push(`%${query.name}%`);
      }

      if (query.description) {
        where.push(`p.description LIKE ?`);
        params.push(`%${query.description}%`);
      }

      if (query.origin) {
        where.push(`p.origin LIKE ?`);
        params.push(`%${query.origin}%`);
      }

      if (query.categoryId) {
        where.push(`p.category_id = ?`);
        params.push(query.categoryId);
      }

      // APPLY WHERE
      if (where.length > 0) {
        baseQuery += " AND " + where.join(" AND ");
      }

      // COUNT
      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total ${baseQuery}`,
        params
      );
      const total = countRows[0].total;

      // SORT
      const order = query.sortAscending ? "ASC" : "DESC";

      const dataQuery = `
        SELECT 
          p.product_id,
          p.name,
          p.description,
          p.origin,
          p.status,
          c.name AS category_name
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
      console.error("searchProductsPublic error:", err);
      res.status(500).json({
        success: false,
        error: "Không thể lấy danh sách sản phẩm công khai",
      });
    }
  },

  /**
   * ➕ Tạo sản phẩm
   */
  createProduct: async (req, res) => {
    try {
      const product = req.body;

      if (!product.name) {
        return res.status(400).json({
          success: false,
          error: "Tên sản phẩm không được để trống",
        });
      }

      const userId = req.user?.userId || null;

      const productId = await productModel.createProduct({
        ...product,
        created_by: userId,
      });

    } catch (err) {
      console.error("createProduct error:", err);
      res.status(500).json({ success: false, error: "Lỗi máy chủ" });
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const { role, userId } = req.user || {};

      const products = await productModel.getAll(role, userId);

      return res.status(200).json({
        success: true,
        data: products
      });

    } catch (err) {
      console.error("getAllProducts error:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi máy chủ"
      });
    }
  },

  /**
   * ♻️ Cập nhật sản phẩm
   */
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const product = req.body;

      const userId = req.user?.userId || null;

      await productModel.updateProduct(id, {
        ...product,
        updated_by: userId,
      });

      res.json({ success: true, message: "Cập nhật sản phẩm thành công" });

    } catch (err) {
      console.error("updateProduct error:", err);
      res.status(500).json({ success: false, error: "Lỗi máy chủ" });
    }
  },

  /**
   * 🗑️ Soft delete
   */
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      await productModel.updateProduct(id, { status: "discontinued" });

      res.json({
        success: true,
        message: "Đã ngừng kinh doanh sản phẩm",
      });

    } catch (err) {
      console.error("deleteProduct error:", err);
      res.status(500).json({ success: false, error: "Lỗi máy chủ" });
    }
  },
};

module.exports = productsController;
