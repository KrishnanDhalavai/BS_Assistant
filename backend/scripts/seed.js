const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  console.log('Starting MySQL Database Seeding...');

  // Connect to MySQL server without specifying the database first
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'brawlstars_draft';

  try {
    // 1. Create database
    console.log(`Creating database "${dbName}" if it does not exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);

    // 2. Drop existing tables if they exist to start fresh
    console.log('Dropping existing tables to avoid duplicate keys...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('DROP TABLE IF EXISTS synergies;');
    await connection.query('DROP TABLE IF EXISTS counters;');
    await connection.query('DROP TABLE IF EXISTS brawlers;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    // 3. Create tables
    console.log('Creating tables...');
    await connection.query(`
      CREATE TABLE brawlers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE counters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        enemy_brawler VARCHAR(255) NOT NULL,
        counter_brawler VARCHAR(255) NOT NULL,
        weight INT NOT NULL,
        FOREIGN KEY (enemy_brawler) REFERENCES brawlers(name) ON DELETE CASCADE,
        FOREIGN KEY (counter_brawler) REFERENCES brawlers(name) ON DELETE CASCADE,
        UNIQUE KEY unique_counter (enemy_brawler, counter_brawler)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE synergies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        brawler VARCHAR(255) NOT NULL,
        synergy_brawler VARCHAR(255) NOT NULL,
        weight INT NOT NULL,
        FOREIGN KEY (brawler) REFERENCES brawlers(name) ON DELETE CASCADE,
        FOREIGN KEY (synergy_brawler) REFERENCES brawlers(name) ON DELETE CASCADE,
        UNIQUE KEY unique_synergy (brawler, synergy_brawler)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Parse counters.json
    const countersPath = path.resolve(__dirname, '../../counters.json');
    if (!fs.existsSync(countersPath)) {
      throw new Error(`counters.json not found at expected path: ${countersPath}`);
    }

    let rawData = fs.readFileSync(countersPath, 'utf8').trim();
    const jsonMatch = rawData.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in counters.json");
    }
    const countersData = JSON.parse(jsonMatch[0]);

    // 5. Extract all unique brawler names
    const brawlerNames = new Set();
    for (const enemy of Object.keys(countersData)) {
      brawlerNames.add(enemy);
      const list = countersData[enemy];
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.counter) {
            brawlerNames.add(item.counter);
          }
        }
      }
    }

    // Add some common brawlers if they are not present just in case (for synergies)
    const extraBrawlers = ['Gene', 'Surge', 'Max', 'Poco', 'Byron', 'Bull', 'Rosa', 'Frank', 'Primo', 'Buster', 'Gus', 'Edgar', 'Mortis', 'Leon', 'Ruffs', 'Piper', 'Nani', 'Belle'];
    for (const b of extraBrawlers) {
      brawlerNames.add(b);
    }

    const sortedBrawlers = Array.from(brawlerNames).sort();
    console.log(`Extracted ${sortedBrawlers.length} unique brawlers.`);

    // 6. Insert Brawlers
    console.log('Inserting brawlers into database...');
    const brawlerValues = sortedBrawlers.map(name => [name]);
    await connection.query(
      'INSERT INTO brawlers (name) VALUES ?',
      [brawlerValues]
    );

    // 7. Insert Counters
    console.log('Inserting counter relationships...');
    const counterValues = [];
    for (const enemy of Object.keys(countersData)) {
      const list = countersData[enemy];
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.counter && item.weight !== undefined) {
            counterValues.push([enemy, item.counter, item.weight]);
          }
        }
      }
    }

    if (counterValues.length > 0) {
      await connection.query(
        'INSERT INTO counters (enemy_brawler, counter_brawler, weight) VALUES ?',
        [counterValues]
      );
      console.log(`Inserted ${counterValues.length} counter relationships.`);
    }

    // 8. Seed Synergies
    console.log('Inserting sample competitive synergies...');
    // Formulate a set of meta synergies
    const sampleSynergies = [
      // Format: [brawler, synergy_brawler, weight]
      // Max Synergies
      ['Max', 'Gene', 5],
      ['Max', 'Surge', 4],
      ['Max', 'Tara', 4],
      // Poco Double Tank Synergies
      ['Poco', 'Bull', 5],
      ['Poco', 'Frank', 5],
      ['Poco', 'Rosa', 4],
      // Byron Tank Synergies
      ['Byron', 'Bull', 5],
      ['Byron', 'Primo', 5],
      ['Byron', 'Rosa', 4],
      // Gus + Assassins
      ['Gus', 'Edgar', 5],
      ['Gus', 'Mortis', 4],
      ['Gus', 'Leon', 4],
      // Ruffs + Sharpshooters
      ['Ruffs', 'Piper', 5],
      ['Ruffs', 'Nani', 5],
      ['Ruffs', 'Belle', 4]
    ];

    // Filter synergies to ensure both brawlers exist in the unique set (safety check)
    const validSynergies = sampleSynergies.filter(([b1, b2]) => {
      return brawlerNames.has(b1) && brawlerNames.has(b2);
    });

    if (validSynergies.length > 0) {
      await connection.query(
        'INSERT INTO synergies (brawler, synergy_brawler, weight) VALUES ?',
        [validSynergies]
      );
      console.log(`Inserted ${validSynergies.length} synergy relationships.`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Execute seeding if run directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seed;
