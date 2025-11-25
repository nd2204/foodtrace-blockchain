/**
 * search.loader.js
 * Khởi tạo MiniSearch bằng dữ liệu có sẵn trong MySQL
 */

const { getPool } = require("../config/db.config"); 
const SearchService = require("../services/search.service");

async function loadInitialSearchIndex() {
  const pool = await getPool();

  // Load Farms
  const [farms] = await pool.query(`
    SELECT farm_id AS id, name, address
    FROM farms
    WHERE is_active = TRUE
  `);

  const farmDocs = farms.map(f => ({
    id: `farm-${f.id}`,
    name: f.name,
    address: f.address,
    type: "farm",
  }));

  // Load Products
  const [products] = await pool.query(`
    SELECT product_id AS id, name, origin AS address
    FROM products
    WHERE is_active = TRUE
  `);

  const productDocs = products.map(p => ({
    id: `product-${p.id}`,
    name: p.name,
    type: "product",
    address: p.address,
  }));

  // Load Licenses
  const [licenses] = await pool.query(`
    SELECT license_id AS id, license_number, license_type
    FROM farm_licenses
  `);

  const licenseDocs = licenses.map(l => ({
    id: `license-${l.id}`,
    name: l.license_number,
    type: "license",
  }));

  // Load Batches
  const [batches] = await pool.query(`
    SELECT batch_id AS id, batch_number
    FROM batches
  `);

  const batchDocs = batches.map(b => ({
    id: `batch-${b.id}`,
    name: b.batch_number,
    type: "batch",
  }));

  const allDocs = [
    ...farmDocs,
    ...productDocs,
    ...licenseDocs,
    ...batchDocs,
  ];

  console.log(`🔎 Loading MiniSearch index: ${allDocs.length} records...`);

  SearchService.addBulk(allDocs);

  console.log("✅ MiniSearch indexing complete!");
}

module.exports = loadInitialSearchIndex;
