const db = require('../config/db');

class SynergyRepository {
  async getSynergiesForAllies(allyBrawlers) {
    if (!allyBrawlers || allyBrawlers.length === 0) {
      return [];
    }
    const [rows] = await db.query(
      'SELECT brawler, synergy_brawler, weight FROM synergies WHERE brawler IN (?)',
      [allyBrawlers]
    );
    return rows;
  }
}

module.exports = new SynergyRepository();
