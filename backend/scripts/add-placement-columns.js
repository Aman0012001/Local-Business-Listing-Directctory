const { Client } = require('pg');

const client = new Client({
  host: '66.33.22.240',
  port: 45505,
  user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
  database: 'railway',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('Connected to Railway DB');

  const columns = [
    { name: 'show_on_home',       default: 'true' },
    { name: 'show_on_category',   default: 'true' },
    { name: 'show_on_listing',    default: 'true' },
    { name: 'show_on_offer_page', default: 'true' },
    { name: 'show_on_event_page', default: 'false' },
  ];

  for (const col of columns) {
    try {
      await client.query(
        `ALTER TABLE offer_event_pricing ADD COLUMN IF NOT EXISTS ${col.name} boolean NOT NULL DEFAULT ${col.default}`
      );
      console.log(`✅ Column ${col.name} OK`);
    } catch (e) {
      console.error(`❌ ${col.name}:`, e.message);
    }
  }

  // Verify
  const result = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='offer_event_pricing' AND column_name LIKE 'show%' ORDER BY column_name`
  );
  console.log('Columns in DB:', result.rows.map(r => r.column_name));

  await client.end();
  console.log('Done.');
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
