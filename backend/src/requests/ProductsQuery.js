const BaseQuery = require("./BaseQuery");

class ProductsQuery extends BaseQuery {
  constructor(body = {}) {
    super(body);

    this.name = body.name || null;
    this.description = body.description || null;
    this.origin = body.origin || null;
    this.categoryId = body.categoryId || null;
    this.status = body.status || null;
  }
}

module.exports = ProductsQuery;
