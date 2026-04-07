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

  // 1. Ensure target_id exists in active_plans
  try {
    await client.query(
      `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS target_id uuid`
    );
    console.log('✅ Column target_id OK');
  } catch (e) {
    console.error('❌ target_id:', e.message);
  }

  // 2. Ensure offer_plan_id exists in active_plans
  try {
    await client.query(
      `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS offer_plan_id uuid`
    );
    console.log('✅ Column offer_plan_id OK');
  } catch (e) {
    console.error('❌ offer_plan_id:', e.message);
  }

  // 3. Ensure plan_id is nullable (it was likely not nullable before)
  try {
    await client.query(
        `ALTER TABLE active_plans ALTER COLUMN plan_id DROP NOT NULL`
      );
      console.log('✅ Column plan_id set to nullable OK');
  } catch (e) {
    console.error('❌ plan_id nullable:', e.message);
  }

  // 4. Add foreign key for offer_plan_id if it doesn't exist
  try {
    // Check if constraint exists first
    const constraints = await client.query(
        `SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = 'active_plans' AND column_name = 'offer_plan_id'`
    );
    if (constraints.rows.length === 0) {
        await client.query(
            `ALTER TABLE active_plans ADD CONSTRAINT FK_active_plans_offer_plan FOREIGN KEY (offer_plan_id) REFERENCES offer_event_pricing(id) ON DELETE SET NULL`
        );
        console.log('✅ Foreign Key for offer_plan_id added OK');
    } else {
        console.log('✅ Foreign Key for offer_plan_id already exists');
    }
  } catch (e) {
    console.warn('⚠️ FK offer_plan_id (check if offer_event_pricing table exists):', e.message);
  }

  // 5. Verify all columns in active_plans
  const result = await client.query(
    `SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name='active_plans' ORDER BY column_name`
  );
  console.log('Active Plans table structure:');
  result.rows.forEach(r => {
    console.log(`${r.column_name}: ${r.data_type} (Nullable: ${r.is_nullable})`);
  });

  await client.end();
  console.log('Done.');
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
