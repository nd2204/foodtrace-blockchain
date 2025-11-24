/**
 * search.service.js
 * MiniSearch thay thế MeiliSearch
 */
const MiniSearch = require("minisearch");

class SearchService {
  constructor() {
    this.index = new MiniSearch({
      fields: ["name", "type", "category", "address", "license_number", "batch_number"],
      storeFields: ["id", "name", "type", "category", "address", "extra"],
      searchOptions: {
        fuzzy: 0.2,
        prefix: true,
      },
    });
  }

  add(doc) {
    try {
      this.index.add(doc);
    } catch (e) {
      this.index.replace(doc);
    }
  }

  remove(id) {
    this.index.discard(id);
  }

  search(query) {
    return this.index.search(query);
  }

  addBulk(list) {
    this.index.addAll(list);
  }
}

module.exports = new SearchService();
