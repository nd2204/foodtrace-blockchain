const BaseQuery = require("./BaseQuery");

class CategoriesQuery extends BaseQuery {
  constructor(body = {}) {
    super(body);

    this.name = body.name || null;
    this.description = body.description || null;
  }
}

module.exports = CategoriesQuery;
