
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log(`Connecting to ${process.env.DB_HOST}:${process.env.DB_PORT}...`);
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
