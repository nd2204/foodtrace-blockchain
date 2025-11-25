const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'FoodTrace',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function getPool() {
  if (!pool) {
    try {
      console.log('Config:', config); // Debug config
      pool = await mysql.createPool(config);
      console.log('✅ Connected to MySQL database:', config.database);
    } catch (err) {
      console.error('❌ MySQL connection error:', err.message);
      throw err;
    }
  }
  return pool;
}

module.exports = { getPool };