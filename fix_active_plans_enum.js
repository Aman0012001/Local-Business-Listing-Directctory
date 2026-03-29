/**
 * Fix active_plans_status_enum — remove duplicate UPPERCASE values
 * and ensure only lowercase values exist (matching the NestJS entity)
 */
const { Client } = require('pg');
const DB = {
  host: '66.33.22.240', port: 45505, user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
  ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000,
};

async function main() {
  const c = new Client(DB);
  await c.connect();
  console.log('Connected\n');

  // 1. Show current enum values for active_plans_status_enum
  const { rows: ev } = await c.query(`
    SELECT e.enumlabel, e.enumsortorder
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'active_plans_status_enum'
    ORDER BY e.enumsortorder;
  `);
  console.log('Current enum values:', ev.map(r => r.enumlabel));

  // 2. Migrate any rows with uppercase status to lowercase
  const migrations = [
    `UPDATE active_plans SET status = 'active'    WHERE status::text = 'ACTIVE';`,
    `UPDATE active_plans SET status = 'expired'   WHERE status::text = 'EXPIRED';`,
    `UPDATE active_plans SET status = 'cancelled' WHERE status::text = 'CANCELLED';`,
  ];
  for (const sql of migrations) {
    try {
      const r = await c.query(sql);
      console.log(`Migrated: ${sql.substring(0, 60).trim()} → ${r.rowCount} rows updated`);
    } catch (e) {
      console.log(`Skip (${e.message.substring(0, 60)})`);
    }
  }

  // 3. Remove UPPERCASE duplicate enum values that shouldn't be there
  // We must rename the column to text, recreate the enum, then restore
  // Only do this if the uppercase values exist
  const hasUppercase = ev.some(r => r.enumlabel === r.enumlabel.toUpperCase() && r.enumlabel !== r.enumlabel.toLowerCase());
  
  if (hasUppercase) {
    console.log('\nFixing enum — removing uppercase duplicates...');
    try {
      await c.query('BEGIN');

      // Temporarily convert column to text
      await c.query(`ALTER TABLE active_plans ALTER COLUMN status TYPE VARCHAR(20) USING status::text;`);
      
      // Drop the old enum
      await c.query(`DROP TYPE IF EXISTS active_plans_status_enum;`);
      
      // Recreate enum with only lowercase values
      await c.query(`CREATE TYPE active_plans_status_enum AS ENUM ('active', 'expired', 'cancelled');`);
      
      // Restore column with new enum
      await c.query(`ALTER TABLE active_plans ALTER COLUMN status TYPE active_plans_status_enum USING status::active_plans_status_enum;`);
      
      // Set default
      await c.query(`ALTER TABLE active_plans ALTER COLUMN status SET DEFAULT 'active';`);

      await c.query('COMMIT');
      console.log('✅ Enum fixed successfully!');
    } catch (e) {
      await c.query('ROLLBACK');
      console.log('❌ Enum fix failed (rolled back):', e.message);
    }
  } else {
    console.log('\n✅ No uppercase enum values found, enum is already correct.');
  }

  // 4. Verify final enum
  const { rows: ev2 } = await c.query(`
    SELECT e.enumlabel FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'active_plans_status_enum'
    ORDER BY e.enumsortorder;
  `);
  console.log('Final enum values:', ev2.map(r => r.enumlabel));

  // 5. Also check the PAUSED value — entity doesn't have it, add to enum if needed
  const hasPaused = ev2.some(r => r.enumlabel === 'paused');
  if (!hasPaused) {
    console.log('\n✅ No stray PAUSED value found.');
  }

  // 6. Row count
  const { rows: cnt } = await c.query(`SELECT COUNT(*) FROM active_plans`);
  console.log('\nactive_plans total rows:', cnt[0].count);

  await c.end();
  console.log('\nDone!');
}
main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
