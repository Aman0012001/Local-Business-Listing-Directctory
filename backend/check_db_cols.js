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
  const r1 = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'offer_events' AND column_name IN ('placements','is_active','is_featured')"
  );
  console.log('offer_events cols:', JSON.stringify(r1.rows));

  const r2 = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'promotion_bookings' AND column_name IN ('placements','start_time','end_time','status')"
  );
  console.log('promotion_bookings cols:', JSON.stringify(r2.rows));

  // Also test the raw query that's failing
  try {
    const r3 = await client.query(
      "SELECT id FROM offer_events WHERE placements @> $1::jsonb LIMIT 1",
      [JSON.stringify(['listing'])]
    );
    console.log('JSONB query OK, rows:', r3.rows.length);
  } catch(e) {
    console.error('JSONB query FAILED:', e.message);
  }

  await client.end();
}).catch(e => console.error('Connection error:', e.message));
