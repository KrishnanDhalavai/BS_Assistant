const db = require('../config/db');

class CounterRepository {
  async getCountersForEnemies(enemyBrawlers) {
    if (!enemyBrawlers || enemyBrawlers.length === 0) {
      return [];
    }
    const [rows] = await db.query(
      'SELECT enemy_brawler, counter_brawler, weight FROM counters WHERE enemy_brawler IN (?)',
      [enemyBrawlers]
    );
    return rows;
  }
}

module.exports = new CounterRepository();
