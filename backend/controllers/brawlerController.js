const brawlerRepository = require('../repositories/brawlerRepository');

class BrawlerController {
  async getAllBrawlers(req, res, next) {
    try {
      const brawlers = await brawlerRepository.getAll();
      return res.json(brawlers);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BrawlerController();
