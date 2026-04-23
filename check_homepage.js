
const { Client } = require('pg');

async function checkHomepageOffers() {
  const client = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`
        SELECT id, title, placements, is_featured, is_active, status, start_date, expiry_date 
        FROM offer_events 
        WHERE placements @> '["homepage"]'::jsonb;
    `);
    console.log('Homepage Placed Offers:', JSON.stringify(res.rows, null, 2));

    const res2 = await client.query(`
        SELECT id, title, placements, is_featured, is_active, status, start_date, expiry_date 
        FROM offer_events 
        WHERE is_featured = true;
    `);
    console.log('Featured Offers:', JSON.stringify(res2.rows, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkHomepageOffers();
