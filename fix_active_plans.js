const { Client } = require('pg');

const DB = {
  host: '66.33.22.240',
  port: 45505,
  user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
  database: 'railway',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
};

async function main() {
  const client = new Client(DB);
  await client.connect();
  console.log('Connected to Railway DB\n');

  // 1. Show current active_plans schema
  const { rows: cols } = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'active_plans'
    ORDER BY ordinal_position;
  `);
  console.log('Current active_plans columns:');
  cols.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`));
  console.log();

  const existingCols = new Set(cols.map(c => c.column_name));

  // 2. All columns required by the entity
  const fixes = [
    {
      col: 'vendor_id',
      sql: `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS vendor_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';`,
    },
    {
      col: 'plan_id',
      sql: `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS plan_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';`,
    },
    {
      col: 'target_id',
      sql: `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS target_id UUID;`,
    },
    {
      col: 'status',
      sql: `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';`,
    },
    {
      col: 'start_date',
      sql: `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS start_date TIMESTAMP NOT NULL DEFAULT NOW();`,
    },
    {
      col: 'end_date',
      sql: `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS end_date TIMESTAMP NOT NULL DEFAULT NOW();`,
    },
    {
      col: 'amount_paid',
      sql: `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2);`,
    },
    {
      col: 'transaction_id',
      sql: `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS transaction_id VARCHAR;`,
    },
    {
      col: 'created_at',
      sql: `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();`,
    },
    {
      col: 'updated_at',
      sql: `ALTER TABLE active_plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();`,
    },
  ];

  let fixed = 0;
  for (const { col, sql } of fixes) {
    if (!existingCols.has(col)) {
      try {
        await client.query(sql);
        console.log(`  FIXED: Added column ${col}`);
        fixed++;
      } catch (e) {
        console.log(`  ERROR adding ${col}: ${e.message}`);
      }
    } else {
      console.log(`  OK:    ${col} already exists`);
    }
  }

  // 3. Add indexes if missing
  const indexFixes = [
    `CREATE INDEX IF NOT EXISTS idx_active_plans_vendor_status ON active_plans(vendor_id, status);`,
    `CREATE INDEX IF NOT EXISTS idx_active_plans_target_status ON active_plans(target_id, status);`,
  ];
  for (const sql of indexFixes) {
    try { await client.query(sql); } catch (e) { /* ignore */ }
  }

  // 4. Show final schema
  console.log('\nFinal active_plans schema:');
  const { rows: finalCols } = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'active_plans'
    ORDER BY ordinal_position;
  `);
  finalCols.forEach(c => console.log(`  + ${c.column_name}: ${c.data_type}`));

  // 5. Row count
  const { rows: cnt } = await client.query(`SELECT COUNT(*) FROM active_plans`);
  console.log(`\nactive_plans rows: ${cnt[0].count}`);
  console.log(`\nFixed ${fixed} column(s). Done!`);

  await client.end();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
