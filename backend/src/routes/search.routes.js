const express = require("express");
const router = express.Router();

const searchController = require("../controllers/search.controller");

// 🔍 Public search (không cần token)
router.get("/", searchController.search);

module.exports = router;
