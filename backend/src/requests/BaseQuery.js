class BaseQuery {
  constructor(body = {}) {
    this.pageIndex = body.pageIndex ?? 1;
    this.pageSize = body.pageSize ?? 20;

    this.sortColumn = body.sortColumn || "created_at";
    this.sortAscending = body.sortAscending ?? true;

    this.filter = body.filter || "";
    this.status = body.status ?? -1;
  }
}

module.exports = BaseQuery;
