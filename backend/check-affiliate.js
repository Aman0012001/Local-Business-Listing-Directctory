const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkAffiliate() {
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
    
    console.log('--- CHECKING AFFILIATES TABLE ---');
    
    const targetCode = 'r3TFUSu77h';
    const upperCode = targetCode.toUpperCase();
    
    console.log(`Checking for code: ${targetCode} or ${upperCode}`);
    
    const res = await client.query(`
      SELECT id, user_id, referral_code, status 
      FROM affiliates 
      WHERE referral_code ILIKE $1 OR referral_code ILIKE $2
    `, [targetCode, upperCode]);
    
    console.log('Results FOUND:', res.rows.length);
    console.log(JSON.stringify(res.rows, null, 2));

    if (res.rows.length === 0) {
      console.log('No matches found. Listing top 10 affiliates to see their codes:');
      const allRes = await client.query(`
        SELECT referral_code 
        FROM affiliates 
        LIMIT 10
      `);
      console.log('Sample codes:', allRes.rows.map(r => r.referral_code));
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkAffiliate();
