const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkConnection() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Connecting to:', process.env.DB_HOST);
    await client.connect();
    console.log('Successfully connected to the database!');
    const res = await client.query('SELECT current_database(), current_user, version()');
    console.log('Database details:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

checkConnection();
