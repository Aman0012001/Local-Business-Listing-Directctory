
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Try both local and current dir
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };

  console.log('--- DB Config ---');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('User:', config.user);
  console.log('DB Name:', config.database);
  console.log('SSL:', config.ssl ? 'ON (Unauthorized: false)' : 'OFF');
  console.log('-----------------');

  const client = new Client(config);

  try {
    console.log(`Connecting...`);
    await client.connect();
    console.log('✅ Connection successful!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Full error:', err);
  }
}

testConnection();
