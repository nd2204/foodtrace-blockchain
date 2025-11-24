/**
 * search.controller.js
 */
const SearchService = require("../services/search.service");

const searchController = {
  search: async (req, res) => {
    const { query, type } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Thiếu query tìm kiếm",
      });
    }

    try {
      let results = SearchService.search(query);

      if (type) {
        results = results.filter(item => item.type === type);
      }

      return res.status(200).json({
        success: true,
        query,
        type: type || "all",
        hits: results,
        total: results.length,
      });
    } catch (err) {
      console.error("❌ search error:", err.message);
      return res.status(500).json({ success: false, error: "Lỗi khi tìm kiếm dữ liệu" });
    }
  },
};

module.exports = searchController;
