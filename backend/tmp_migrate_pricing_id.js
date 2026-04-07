const { Client } = require('pg');

const client = new Client({
  host: '66.33.22.240',
  port: 45505,
  user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
  database: 'railway',
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to database.');

    // Add pricing_id column
    await client.query('ALTER TABLE offer_events ADD COLUMN IF NOT EXISTS pricing_id UUID');
    console.log('Column pricing_id added to offer_events.');

    // Add index
    await client.query('CREATE INDEX IF NOT EXISTS idx_offer_events_pricing_id ON offer_events(pricing_id)');
    console.log('Index added to pricing_id.');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
