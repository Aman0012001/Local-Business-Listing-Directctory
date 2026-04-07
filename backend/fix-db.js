const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function fixDb() {
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
    
    console.log('--- FIXING DUPLICATE NAMES IN CATEGORIES ---');
    const delQuery = "DELETE FROM categories WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at DESC) as row_num FROM categories) t WHERE t.row_num > 1)";
    const delRes = await client.query(delQuery);
    console.log('Deleted ' + delRes.rowCount + ' duplicate categories.');

    console.log('--- FIXING NULL REFERRAL CODES IN AFFILIATES ---');
    // Check if table exists first
    const tc = await client.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'affiliates'");
    if (tc.rows[0].count > 0) {
      const updAff = await client.query("UPDATE affiliates SET referral_code = 'REF-' || substring(id::text, 1, 8) WHERE referral_code IS NULL");
      console.log('Updated ' + updAff.rowCount + ' affiliate referral codes.');
    }

    console.log('✅ Cleanup complete. Retrying TypeORM sync...');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixDb();
