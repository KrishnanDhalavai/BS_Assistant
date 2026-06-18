const express = require('express');
const router = express.Router();
const brawlerController = require('../controllers/brawlerController');
const recommendationController = require('../controllers/recommendationController');

router.get('/brawlers', brawlerController.getAllBrawlers);
router.post('/recommend', recommendationController.getRecommendations);

module.exports = router;
