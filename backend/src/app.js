// app.js (updated)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
// const startLocalMeili = require('./config/search.start');
app.use(cors());
app.use(express.json());

// routes
app.use('/api', require('./routes/search.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/product.routes'));
app.use('/api', require('./routes/batches.routes'));
app.use('/api', require('./routes/farm.routes'));
app.use('/api', require('./routes/trace.routes'));
app.use("/api", require("./routes/farm_licenses.routes"));
app.use("/api", require("./routes/lab_tests.routes"));
app.use("/api", require("./routes/categories.routes"));
app.use("/api", require("./routes/dashboard.routes"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api", require("./routes/media.routes"));
app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

// // 🔄 Khởi động MeiliSearch local khi chạy backend
// startLocalMeili();
module.exports = app;
