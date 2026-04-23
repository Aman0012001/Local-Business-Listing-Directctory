const { Client } = require('pg');
const c = new Client({
  host: '66.33.22.240', port: 45505, user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {
  // Check all pricing-related enums
  const r = await c.query(
    "SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid WHERE t.typname LIKE '%pricing%' ORDER BY t.typname, e.enumsortorder"
  );
  console.log('Pricing enums:');
  r.rows.forEach(row => console.log(' ', row.typname, '->', row.enumlabel));

  // Check if pricing_plans exists
  const t = await c.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='pricing_plans'"
  );
  console.log('\npricing_plans table exists:', t.rows.length > 0);

  await c.end();
}).catch(e => console.error(e.message));
