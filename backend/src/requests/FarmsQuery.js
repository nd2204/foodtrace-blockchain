const BaseQuery = require("./BaseQuery");

class FarmsQuery extends BaseQuery {
  constructor(body = {}) {
    super(body);

    this.farmName = body.farmName || null;
    this.province = body.province || null;
    this.district = body.district || null;
    this.ward = body.ward || null;

    this.farmId = body.farmId || null;
  }
}

module.exports = FarmsQuery;
