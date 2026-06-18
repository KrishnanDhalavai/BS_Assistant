const db = require('../config/db');

class BrawlerRepository {
  async getAll() {
    const [rows] = await db.query('SELECT name FROM brawlers ORDER BY name ASC');
    return rows.map(row => row.name);
  }
}

module.exports = new BrawlerRepository();
