const counterRepository = require('../repositories/counterRepository');
const synergyRepository = require('../repositories/synergyRepository');

class RecommendationService {
  async getRecommendations({ enemyPicks = [], allyPicks = [], bannedBrawlers = [] }) {
    // 1. Normalize and sanitize inputs
    const enemies = (enemyPicks || []).map(p => p.trim()).filter(Boolean);
    const allies = (allyPicks || []).map(p => p.trim()).filter(Boolean);
    const bans = (bannedBrawlers || []).map(p => p.trim()).filter(Boolean);

    // 2. Build set of excluded brawlers (cannot recommend what is already picked or banned)
    const excluded = new Set([
      ...enemies,
      ...allies,
      ...bans
    ]);

    // 3. Accumulate scores
    const candidates = {};

    // Fetch counter relationships for enemy picks
    if (enemies.length > 0) {
      const counterRows = await counterRepository.getCountersForEnemies(enemies);
      for (const row of counterRows) {
        const enemy = row.enemy_brawler;
        const counter = row.counter_brawler;
        const weight = parseInt(row.weight, 10) || 0;

        if (excluded.has(counter)) {
          continue;
        }

        if (!candidates[counter]) {
          candidates[counter] = {
            name: counter,
            counterScore: 0,
            synergyScore: 0,
            reasons: []
          };
        }

        candidates[counter].counterScore += weight;

        // Map weight scale to wording
        let wording = 'Counters';
        if (weight >= 10) {
          wording = 'Hard Counters';
        } else if (weight >= 8) {
          wording = 'Strong Counters';
        } else if (weight >= 6) {
          wording = 'Good Counters';
        } else if (weight >= 4) {
          wording = 'Situational Counters';
        } else if (weight >= 2) {
          wording = 'Weak Counters';
        }

        candidates[counter].reasons.push(`${wording} ${enemy}`);
      }
    }

    // Fetch synergy relationships for ally picks
    if (allies.length > 0) {
      const synergyRows = await synergyRepository.getSynergiesForAllies(allies);
      for (const row of synergyRows) {
        const ally = row.brawler;
        const synergy = row.synergy_brawler;
        const weight = parseInt(row.weight, 10) || 0;

        if (excluded.has(synergy)) {
          continue;
        }

        // Initialize candidate if it doesn't exist yet
        if (!candidates[synergy]) {
          candidates[synergy] = {
            name: synergy,
            counterScore: 0,
            synergyScore: 0,
            reasons: []
          };
        }

        candidates[synergy].synergyScore += weight;

        let wording = 'Synergy with';
        if (weight >= 5) {
          wording = 'Strong Synergy with';
        } else if (weight >= 3) {
          wording = 'Good Synergy with';
        }

        candidates[synergy].reasons.push(`${wording} ${ally}`);
      }
    }

    // Calculate final scores
    const results = Object.values(candidates).map(c => {
      return {
        name: c.name,
        score: c.counterScore + c.synergyScore,
        reasons: c.reasons
      };
    });

    // Sort by score descending, then alphabetically as tie-breaker
    const sorted = results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.name.localeCompare(b.name);
    });

    // Return top 5 recommendations
    return sorted.slice(0, 5);
  }
}

module.exports = new RecommendationService();
