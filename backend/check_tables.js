const { Client } = require('pg');
const client = new Client({
  host: '66.33.22.240',
  port: 45505,
  user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
  // Get all table names that have a "business" or "listing" or similar
  const r = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  console.log('All tables:');
  r.rows.forEach(row => console.log(' -', row.table_name));

  // Test the core query that's failing on business page
  try {
    const test = await client.query(`
      SELECT id FROM offer_events 
      WHERE placements @> $1::jsonb 
      LIMIT 1
    `, [JSON.stringify(['listing'])]);
    console.log('\nJSONB query test: OK (rows:', test.rows.length, ')');
  } catch(e) {
    console.error('\nJSONB query test FAILED:', e.message);
  }

  await client.end();
}).catch(e => console.error('Error:', e.message));
