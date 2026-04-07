const { Client } = require('pg');

const DB = {
  host: '66.33.22.240', port: 45505, user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
  ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000,
};

async function main() {
  const client = new Client(DB);
  await client.connect();
  console.log('Connected\n');

  // 1. Get active_plans full schema
  const { rows: cols } = await client.query(`
    SELECT column_name, data_type, udt_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'active_plans'
    ORDER BY ordinal_position;
  `);
  console.log('=== active_plans COLUMNS ===');
  cols.forEach(c => console.log(`  ${c.column_name.padEnd(20)} ${c.data_type.padEnd(30)} ${c.udt_name}`));

  // 2. Check the status enum values
  const { rows: enumVals } = await client.query(`
    SELECT e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = (
      SELECT udt_name FROM information_schema.columns
      WHERE table_name = 'active_plans' AND column_name = 'status'
    )
    ORDER BY e.enumsortorder;
  `);
  console.log('\n=== active_plans.status ENUM VALUES ===');
  enumVals.forEach(r => console.log(`  - ${r.enumlabel}`));

  // 3. Raw SQL test — simulate what TypeORM would do
  console.log('\n=== TESTING QUERY ===');
  try {
    const { rows } = await client.query(`
      SELECT ap.*, pp.name as plan_name, pp.type as plan_type, pp.price as plan_price
      FROM active_plans ap
      LEFT JOIN pricing_plans pp ON pp.id = ap.plan_id
      WHERE ap.vendor_id = '00000000-0000-0000-0000-000000000000'
        AND ap.status = 'active'
      ORDER BY ap.created_at DESC
      LIMIT 1;
    `);
    console.log('  Query OK. Rows:', rows.length);
  } catch (e) {
    console.log('  Query FAILED:', e.message);
  }

  // 4. Try a broader query
  try {
    const { rows } = await client.query(`SELECT * FROM active_plans LIMIT 3`);
    console.log('\n=== SAMPLE ROWS ===');
    console.log('  Count:', rows.length);
    if (rows.length) console.log('  Sample:', JSON.stringify(rows[0], null, 2));
  } catch (e) {
    console.log('  Error:', e.message);
  }

  // 5. Check subscriptions table columns too
  const { rows: subCols } = await client.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_name = 'subscriptions'
    ORDER BY ordinal_position;
  `);
  console.log('\n=== subscriptions COLUMNS ===');
  subCols.forEach(c => console.log(`  ${c.column_name.padEnd(30)} ${c.data_type.padEnd(30)} ${c.udt_name}`));

  await client.end();
}
main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
