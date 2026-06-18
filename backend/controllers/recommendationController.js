const recommendationService = require('../services/recommendationService');

class RecommendationController {
  async getRecommendations(req, res, next) {
    try {
      const { enemyPicks, allyPicks, bannedBrawlers } = req.body;

      // DTO Validation
      if (enemyPicks !== undefined && !Array.isArray(enemyPicks)) {
        return res.status(400).json({ error: 'enemyPicks must be an array of strings.' });
      }
      if (allyPicks !== undefined && !Array.isArray(allyPicks)) {
        return res.status(400).json({ error: 'allyPicks must be an array of strings.' });
      }
      if (bannedBrawlers !== undefined && !Array.isArray(bannedBrawlers)) {
        return res.status(400).json({ error: 'bannedBrawlers must be an array of strings.' });
      }

      const validateStringArray = (arr) => {
        if (!arr) return true;
        return arr.every(item => typeof item === 'string');
      };

      if (!validateStringArray(enemyPicks) || !validateStringArray(allyPicks) || !validateStringArray(bannedBrawlers)) {
        return res.status(400).json({ error: 'All elements in draft selection arrays must be strings.' });
      }

      const recommendations = await recommendationService.getRecommendations({
        enemyPicks: enemyPicks || [],
        allyPicks: allyPicks || [],
        bannedBrawlers: bannedBrawlers || []
      });

      return res.json({ recommendations });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecommendationController();
