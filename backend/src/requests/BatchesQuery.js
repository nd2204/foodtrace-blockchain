const BaseQuery = require("./BaseQuery");

class BatchesQuery extends BaseQuery {
  constructor(body = {}) {
    super(body);

    this.batchCode = body.batchCode || null;
    this.productName = body.productName || null;
    this.farmName = body.farmName || null;

    this.productId = body.productId || null;
    this.farmId = body.farmId || null;
  }
}

module.exports = BatchesQuery;
