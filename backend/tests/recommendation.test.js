const recommendationService = require('../services/recommendationService');
const counterRepository = require('../repositories/counterRepository');
const synergyRepository = require('../repositories/synergyRepository');

// Mock repositories
jest.mock('../repositories/counterRepository');
jest.mock('../repositories/synergyRepository');

describe('Recommendation Engine Isolated Logic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should aggregate scores correctly for multiple enemy picks', async () => {
    // Buzz: Cordelius +10, Charlie +8
    // Shelly: Cordelius +8, Amber +8
    // Expected result: Cordelius = 18, Amber = 8, Charlie = 8 (Amber sorted first due to alphabetical order)
    counterRepository.getCountersForEnemies.mockResolvedValue([
      { enemy_brawler: 'Buzz', counter_brawler: 'Cordelius', weight: 10 },
      { enemy_brawler: 'Buzz', counter_brawler: 'Charlie', weight: 8 },
      { enemy_brawler: 'Shelly', counter_brawler: 'Cordelius', weight: 8 },
      { enemy_brawler: 'Shelly', counter_brawler: 'Amber', weight: 8 },
    ]);
    synergyRepository.getSynergiesForAllies.mockResolvedValue([]);

    const result = await recommendationService.getRecommendations({
      enemyPicks: ['Buzz', 'Shelly'],
      allyPicks: [],
      bannedBrawlers: []
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      name: 'Cordelius',
      score: 18,
      reasons: ['Hard Counters Buzz', 'Strong Counters Shelly']
    });
    expect(result[1]).toEqual({
      name: 'Amber',
      score: 8,
      reasons: ['Strong Counters Shelly']
    });
    expect(result[2]).toEqual({
      name: 'Charlie',
      score: 8,
      reasons: ['Strong Counters Buzz']
    });
  });

  test('should exclude banned brawlers, active ally picks, and active enemy picks from recommendations', async () => {
    counterRepository.getCountersForEnemies.mockResolvedValue([
      { enemy_brawler: 'Buzz', counter_brawler: 'Cordelius', weight: 10 },
      { enemy_brawler: 'Buzz', counter_brawler: 'Charlie', weight: 8 },
      { enemy_brawler: 'Shelly', counter_brawler: 'Cordelius', weight: 8 },
      { enemy_brawler: 'Shelly', counter_brawler: 'Amber', weight: 8 },
    ]);
    synergyRepository.getSynergiesForAllies.mockResolvedValue([]);

    const result = await recommendationService.getRecommendations({
      enemyPicks: ['Buzz', 'Shelly'],
      allyPicks: ['Charlie'], // Exclude Charlie
      bannedBrawlers: ['Cordelius'] // Exclude Cordelius
    });

    // Cordelius (banned) and Charlie (ally pick) should be excluded
    // Amber (score 8) should be the only remaining pick
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Amber');
    expect(result[0].score).toBe(8);
  });

  test('should correctly integrate team synergy weights', async () => {
    counterRepository.getCountersForEnemies.mockResolvedValue([
      { enemy_brawler: 'Buzz', counter_brawler: 'Charlie', weight: 8 },
    ]);
    synergyRepository.getSynergiesForAllies.mockResolvedValue([
      { brawler: 'Max', synergy_brawler: 'Charlie', weight: 5 }
    ]);

    const result = await recommendationService.getRecommendations({
      enemyPicks: ['Buzz'],
      allyPicks: ['Max'],
      bannedBrawlers: []
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'Charlie',
      score: 13, // 8 (counter) + 5 (synergy)
      reasons: ['Strong Counters Buzz', 'Strong Synergy with Max']
    });
  });

  test('should return empty recommendations when there are no candidate matches', async () => {
    counterRepository.getCountersForEnemies.mockResolvedValue([]);
    synergyRepository.getSynergiesForAllies.mockResolvedValue([]);

    const result = await recommendationService.getRecommendations({
      enemyPicks: [],
      allyPicks: [],
      bannedBrawlers: []
    });

    expect(result).toEqual([]);
  });

  test('should limit recommendations to top 5', async () => {
    counterRepository.getCountersForEnemies.mockResolvedValue([
      { enemy_brawler: 'Buzz', counter_brawler: 'BrawlerA', weight: 6 },
      { enemy_brawler: 'Buzz', counter_brawler: 'BrawlerB', weight: 6 },
      { enemy_brawler: 'Buzz', counter_brawler: 'BrawlerC', weight: 6 },
      { enemy_brawler: 'Buzz', counter_brawler: 'BrawlerD', weight: 6 },
      { enemy_brawler: 'Buzz', counter_brawler: 'BrawlerE', weight: 6 },
      { enemy_brawler: 'Buzz', counter_brawler: 'BrawlerF', weight: 6 },
    ]);
    synergyRepository.getSynergiesForAllies.mockResolvedValue([]);

    const result = await recommendationService.getRecommendations({
      enemyPicks: ['Buzz'],
      allyPicks: [],
      bannedBrawlers: []
    });

    expect(result).toHaveLength(5);
  });
});
