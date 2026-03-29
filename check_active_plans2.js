const { Client } = require('pg');
const DB = {
  host: '66.33.22.240', port: 45505, user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
  ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000,
};
async function main() {
  const c = new Client(DB);
  await c.connect();

  const { rows } = await c.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_name = 'active_plans'
    ORDER BY ordinal_position
  `);
  console.log('\nACTIVE_PLANS columns:');
  rows.forEach(r => console.log(r.column_name, '|', r.data_type, '|', r.udt_name));

  // Try the exact TypeORM-style query
  try {
    const r2 = await c.query(`
      SELECT "ActivePlan"."id" AS "ActivePlan_id",
             "ActivePlan"."vendor_id" AS "ActivePlan_vendorId",
             "ActivePlan"."plan_id" AS "ActivePlan_planId",
             "ActivePlan"."target_id" AS "ActivePlan_targetId",
             "ActivePlan"."status" AS "ActivePlan_status",
             "ActivePlan"."start_date" AS "ActivePlan_startDate",
             "ActivePlan"."end_date" AS "ActivePlan_endDate",
             "ActivePlan"."amount_paid" AS "ActivePlan_amountPaid",
             "ActivePlan"."transaction_id" AS "ActivePlan_transactionId",
             "ActivePlan"."created_at" AS "ActivePlan_createdAt",
             "ActivePlan"."updated_at" AS "ActivePlan_updatedAt"
      FROM "active_plans" "ActivePlan"
      WHERE "ActivePlan"."vendor_id" = $1
        AND "ActivePlan"."status" = $2
      ORDER BY "ActivePlan"."created_at" DESC
      LIMIT 1
    `, ['00000000-0000-0000-0000-000000000000', 'active']);
    console.log('\nTypeORM-style query: SUCCESS, rows:', r2.rows.length);
  } catch(e) {
    console.log('\nTypeORM-style query FAILED:', e.message);
  }

  // Also test with enum cast
  try {
    const r3 = await c.query(`
      SELECT * FROM active_plans LIMIT 1
    `);
    console.log('\nSimple SELECT: SUCCESS');
  } catch(e) {
    console.log('\nSimple SELECT FAILED:', e.message);
  }

  // Show enum values for status
  const { rows: ev } = await c.query(`
    SELECT e.enumlabel FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname LIKE '%active%'
    ORDER BY e.enumsortorder
  `);
  console.log('\nactive_plans status enum values:', ev.map(r=>r.enumlabel));

  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
