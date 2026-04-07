
const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('Connected to database for seeding search logs...');

    // Clear existing logs (optional, but good for clean test)
    // await client.query('DELETE FROM search_logs');

    const cities = ['mumbai', 'delhi', 'bangalore', 'pune', 'chennai'];
    const keywords = [
      'plumber', 'electrician', 'carpenter', 'ac repair', 'cleaning',
      'pest control', 'painter', 'beautician', 'tutor', 'yoga trainer'
    ];

    const now = new Date();
    const logs = [];

    // Create a spike in "plumber" and "ac repair" in Mumbai
    for (let i = 0; i < 15; i++) {
        const searchedAt = new Date(now.getTime() - Math.random() * 3600000); // last 1 hour
        logs.push({
            id: uuidv4(),
            keyword: 'Plumber',
            normalized_keyword: 'plumber',
            city: 'mumbai',
            searched_at: searchedAt
        });
    }

    for (let i = 0; i < 10; i++) {
        const searchedAt = new Date(now.getTime() - Math.random() * 3600000 * 24); // last 24 hours
        logs.push({
            id: uuidv4(),
            keyword: 'AC Repair',
            normalized_keyword: 'ac repair',
            city: 'mumbai',
            searched_at: searchedAt
        });
    }

    // Add some random logs across other cities and keywords
    for (let i = 0; i < 50; i++) {
        const keyword = keywords[Math.floor(Math.random() * keywords.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const searchedAt = new Date(now.getTime() - Math.random() * 3600000 * 24);
        logs.push({
            id: uuidv4(),
            keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            normalized_keyword: keyword.toLowerCase(),
            city: city,
            searched_at: searchedAt
        });
    }

    console.log(`Inserting ${logs.length} search logs...`);

    for (const log of logs) {
        await client.query(
            'INSERT INTO search_logs (id, keyword, normalized_keyword, city, searched_at) VALUES ($1, $2, $3, $4, $5)',
            [log.id, log.keyword, log.normalized_keyword, log.city, log.searched_at]
        );
    }

    console.log('✅ Successfully seeded search logs!');
  } catch (err) {
    console.error('❌ Error seeding search logs:', err);
  } finally {
    await client.end();
  }
}

seed();
