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

  // 1. Drop the NOT NULL constraint on subscription_id
  try {
    await client.query('ALTER TABLE transactions ALTER COLUMN subscription_id DROP NOT NULL');
    console.log('✅ subscription_id is now nullable');
  } catch (e) {
    console.error('❌ subscription_id:', e.message);
  }

  // 2. Verify
  const result = await client.query(`
    SELECT column_name, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'subscription_id'
  `);
  console.log('Result:', result.rows);

  await client.end();
  console.log('Done.');
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
