const app = require('./app');
const { getPool } = require('./config/db.config');

const PORT = process.env.PORT || 3000;
const loadInitialSearchIndex = require("./init/search.loader");
getPool().catch((err) => console.error('Failed to initialize pool:', err));
loadInitialSearchIndex();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});