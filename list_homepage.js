
const { Client } = require('pg');

async function checkAllHomepageOffers() {
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
        SELECT id, title, placements, is_featured, is_active, status 
        FROM offer_events 
        WHERE placements @> '["homepage"]'::jsonb;
    `);
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkAllHomepageOffers();
