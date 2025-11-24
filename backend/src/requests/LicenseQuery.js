const BaseQuery = require("./BaseQuery");

class LicenseQuery extends BaseQuery {
  constructor(body = {}) {
    super(body);

    this.licenseCode = body.licenseCode || null;
    this.farmName = body.farmName || null;
    this.farmId = body.farmId || null;
    this.status = body.status ?? null; // chấp nhận null
  }
}

module.exports = LicenseQuery;
