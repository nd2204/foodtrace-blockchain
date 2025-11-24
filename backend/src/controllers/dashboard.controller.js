const { getPool } = require("../config/db.config");
const redis = require("../utils/redis"); // bạn cần file redis config

const dashboardController = {

  /**
   * 📊 TỔNG QUAN DASHBOARD (farm, product, batch)
   * - Cache Redis 60 giây
   */
  summary: async (req, res) => {
    const { role, userId } = req.user || {};
    const pool = await getPool();
    const cacheKey = `dashboard_summary_${role}_${userId}`;

    try {
      // 1️⃣ Kiểm tra cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          cached: true,
          data: JSON.parse(cached)
        });
      }

      // 2️⃣ Build role filter
      const filterFarm = role === "manufacturer" ? `WHERE created_by=${userId}` : "";
      const filterProduct = role === "manufacturer" ? `WHERE created_by=${userId}` : "";
      const filterBatch = role === "manufacturer" ? `WHERE created_by=${userId}` : "";

      // 3️⃣ Query DB
      const [[farms]] = await pool.query(`SELECT COUNT(*) AS total FROM farms ${filterFarm}`);
      const [[products]] = await pool.query(`SELECT COUNT(*) AS total FROM products ${filterProduct}`);
      const [[batches]] = await pool.query(`SELECT COUNT(*) AS total FROM batches ${filterBatch}`);

      const result = {
        farms: farms.total,
        products: products.total,
        batches: batches.total
      };

      // 4️⃣ Cache vào Redis 60 giây
      await redis.set(cacheKey, JSON.stringify(result), "EX", 60);

      return res.status(200).json({
        success: true,
        cached: false,
        data: result
      });

    } catch (err) {
      console.error("Dashboard summary error:", err);
      res.status(500).json({ success: false, error: "Không lấy được dữ liệu dashboard" });
    }
  },

  /**
   * 📈 Biểu đồ Batch theo loại:
   * - daily → 7 ngày gần nhất
   * - monthly → 12 tháng gần nhất
   * - yearly → theo năm
   * - Cache Redis 120 giây
   */
  batchStats: async (req, res) => {
    const { type = "monthly" } = req.query;
    const { role, userId } = req.user || {};
    const pool = await getPool();

    const cacheKey = `batch_stats_${type}_${role}_${userId}`;

    try {
      // 1️⃣ Check cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          cached: true,
          type,
          data: JSON.parse(cached)
        });
      }

      // 🔒 Role filter
      const roleFilter = role === "manufacturer" ? `AND created_by=${userId}` : "";

      let groupBy, filter;

      if (type === "daily") {
        groupBy = "DATE(created_at)";
        filter = "WHERE created_at >= DATE(NOW()) - INTERVAL 7 DAY";
      } 
      else if (type === "yearly") {
        groupBy = "YEAR(created_at)";
        filter = "WHERE 1=1";
      } 
      else {
        groupBy = `DATE_FORMAT(created_at, "%Y-%m")`;
        filter = "WHERE created_at >= DATE(NOW()) - INTERVAL 12 MONTH";
      }

      const [rows] = await pool.query(`
        SELECT ${groupBy} AS label, COUNT(*) AS value
        FROM batches
        ${filter}
        ${roleFilter}
        GROUP BY ${groupBy}
        ORDER BY ${groupBy} ASC
      `);

      // 2️⃣ Cache kết quả 120 giây
      await redis.set(cacheKey, JSON.stringify(rows), "EX", 120);

      return res.status(200).json({
        success: true,
        cached: false,
        type,
        data: rows
      });

    } catch (err) {
      console.error("batchStats error:", err);
      res.status(500).json({ success: false, error: "Không lấy được thống kê batch" });
    }
  }

};

module.exports = dashboardController;
