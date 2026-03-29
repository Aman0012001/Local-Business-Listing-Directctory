const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkDuplicates() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log('--- DUPLICATE NAMES IN CATEGORIES ---');
    const res = await client.query(`
      SELECT name, COUNT(*) 
      FROM categories 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);
    console.log(JSON.stringify(res.rows, null, 2));

    if (res.rows.length > 0) {
      console.log('Found duplicates. You will need to delete them.');
    } else {
      console.log('No duplicates found in categories.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkDuplicates();
