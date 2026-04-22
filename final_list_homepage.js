
const { Client } = require('pg');

async function listHomepageOffers() {
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
    const res = await client.query('SELECT title, is_active, status, placements FROM offer_events WHERE placements @> \'["homepage"]\'::jsonb');
    console.log('Currently in DB with homepage placement:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

listHomepageOffers();
