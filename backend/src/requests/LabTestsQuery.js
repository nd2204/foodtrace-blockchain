const BaseQuery = require("./BaseQuery");

class LabTestsQuery extends BaseQuery {
  constructor(body = {}) {
    super(body);

    this.testCode = body.testCode || null;
    this.batchNumber = body.batchNumber || null;
    this.batchId = body.batchId || null;
    this.result = body.result || null;

    this.fromDate = body.fromDate || null;
    this.toDate = body.toDate || null;
  }
}

module.exports = LabTestsQuery;
