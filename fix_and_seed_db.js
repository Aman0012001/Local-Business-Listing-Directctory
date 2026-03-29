/**
 * ============================================================
 *  DB FIX & SEED SCRIPT
 *  1. Add missing stripe columns to subscriptions
 *  2. Seed offer_event_pricing table
 *  3. Fix Free plan to have a stripe_price_id (optional)
 *  4. Fix saved_listings → favorites alias check
 * ============================================================
 */

const { Client } = require('pg');

const DB_CONFIG = {
  host: '66.33.22.240',
  port: 45505,
  user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
  database: 'railway',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
};

async function main() {
  const client = new Client(DB_CONFIG);

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   Railway DB — Targeted Fix & Seed Script    ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  await client.connect();
  console.log('✅ Connected\n');

  // ── 1. Add missing columns to subscriptions ──────────────────
  console.log('🔧 Step 1: Adding missing columns to subscriptions...');
  const subFixes = [
    `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR;`,
    `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR;`,
  ];
  for (const sql of subFixes) {
    try {
      await client.query(sql);
      console.log(`   ✅ ${sql.substring(0, 70)}...`);
    } catch (e) {
      console.log(`   ⚠️  ${e.message}`);
    }
  }

  // ── 2. Check if offer_event_pricing enum types exist ─────────
  console.log('\n🔧 Step 2: Checking/creating enums for offer_event_pricing...');
  
  // Check if the type column uses an enum
  const { rows: colInfo } = await client.query(`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns
    WHERE table_name = 'offer_event_pricing'
    ORDER BY ordinal_position;
  `);
  console.log('   Current offer_event_pricing columns:');
  colInfo.forEach(c => console.log(`     • ${c.column_name}: ${c.data_type} (${c.udt_name})`));

  // ── 3. Seed offer_event_pricing ───────────────────────────────
  console.log('\n🌱 Step 3: Seeding offer_event_pricing plans...');

  const pricingItems = [
    { type: 'offer', name: '1 Hour Promo',     price: 100, unit: 'hours', duration: 1 },
    { type: 'offer', name: '6 Hours Promo',    price: 400, unit: 'hours', duration: 6 },
    { type: 'offer', name: '1 Day Standard',   price: 700, unit: 'days',  duration: 1 },
    { type: 'offer', name: '3 Days Featured',  price: 1500, unit: 'days', duration: 3 },
    { type: 'offer', name: '7 Days Premium',   price: 2500, unit: 'days', duration: 7 },
    { type: 'event', name: '1 Day Event Slot', price: 500, unit: 'days',  duration: 1 },
    { type: 'event', name: '3 Days Event',     price: 1200, unit: 'days', duration: 3 },
    { type: 'event', name: '7 Days Event',     price: 2000, unit: 'days', duration: 7 },
  ];

  for (const item of pricingItems) {
    const { rows: existing } = await client.query(
      `SELECT id FROM offer_event_pricing WHERE name = $1 AND type = $2`,
      [item.name, item.type]
    );
    if (existing.length === 0) {
      try {
        await client.query(
          `INSERT INTO offer_event_pricing (type, name, price, unit, duration, is_active, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())`,
          [item.type, item.name, item.price, item.unit, item.duration]
        );
        console.log(`   ✅ Inserted: [${item.type}] ${item.name} — PKR ${item.price}`);
      } catch (e) {
        console.log(`   ❌ Failed: ${item.name}: ${e.message}`);
      }
    } else {
      console.log(`   ⏭️  Already exists: [${item.type}] ${item.name}`);
    }
  }

  // ── 4. Verify saved_listings vs favorites ─────────────────────
  console.log('\n🔧 Step 4: Checking saved_listings vs favorites...');
  const { rows: favRows } = await client.query(`SELECT COUNT(*) FROM favorites`);
  const { rows: savedRows } = await client.query(`SELECT COUNT(*) FROM saved_listings`);
  console.log(`   favorites table: ${favRows[0].count} rows`);
  console.log(`   saved_listings table: ${savedRows[0].count} rows`);
  
  // Check favorites schema
  const { rows: favCols } = await client.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'favorites' ORDER BY ordinal_position;
  `);
  console.log(`   favorites columns: ${favCols.map(c => c.column_name).join(', ')}`);

  // ── 5. Final data verification ────────────────────────────────
  console.log('\n📊 Step 5: Final verification after fixes...');

  const checks = [
    { label: 'subscriptions.stripe_subscription_id', q: `SELECT column_name FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='stripe_subscription_id'` },
    { label: 'subscriptions.stripe_session_id', q: `SELECT column_name FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='stripe_session_id'` },
    { label: 'offer_event_pricing rows', q: `SELECT COUNT(*) as count FROM offer_event_pricing` },
  ];

  for (const { label, q } of checks) {
    const { rows } = await client.query(q);
    const val = rows[0]?.column_name || rows[0]?.count;
    console.log(`   ✅ ${label}: ${val ?? 'not found'}`);
  }

  // ── 6. Print final summary of all tables & row counts ────────
  console.log('\n📋 COMPLETE TABLE SUMMARY:\n');
  const { rows: allTables } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name;
  `);

  for (const { table_name } of allTables) {
    try {
      const { rows } = await client.query(`SELECT COUNT(*) FROM "${table_name}"`);
      const count = parseInt(rows[0].count);
      const icon = count > 0 ? '✅' : '⬜';
      console.log(`   ${icon} ${table_name.padEnd(35)} ${count} rows`);
    } catch (e) {
      console.log(`   ❌ ${table_name.padEnd(35)} ERROR`);
    }
  }

  await client.end();
  console.log('\n✅ All fixes applied! Disconnected.\n');
}

main().catch(err => {
  console.error('💥 Fatal:', err.message);
  process.exit(1);
});
