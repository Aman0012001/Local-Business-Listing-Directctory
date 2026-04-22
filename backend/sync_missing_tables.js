/** Create only the missing tables using the correct existing enum names from the DB */
const { Client } = require('pg');

const client = new Client({
  host: '66.33.22.240',
  port: 45505,
  user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
});

async function tableExists(name) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`, [name]
  );
  return r.rows.length > 0;
}

async function run() {
  await client.connect();
  console.log('Connected\n');

  // List all tables
  const allTablesRes = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
  );
  const allTables = allTablesRes.rows.map(r => r.table_name);
  console.log('DB tables:', allTables.join(', '), '\n');

  // ─── pricing_plans ───
  if (!allTables.includes('pricing_plans')) {
    // Use the enum names that already exist in DB
    await client.query(`
      CREATE TABLE pricing_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        description TEXT,
        type pricing_plan_type_enum NOT NULL DEFAULT 'subscription',
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        duration INT NOT NULL DEFAULT 30,
        unit pricing_plan_unit_enum NOT NULL DEFAULT 'days',
        stripe_price_id VARCHAR,
        features JSONB DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    console.log('✓ pricing_plans CREATED');
  } else {
    console.log('- pricing_plans already exists');
  }

  // ─── active_plans ───
  if (!allTables.includes('active_plans')) {
    await client.query(`
      CREATE TABLE active_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id UUID NOT NULL,
        plan_id UUID,
        target_id UUID,
        status active_plan_status_enum NOT NULL DEFAULT 'active',
        start_date TIMESTAMP NOT NULL DEFAULT now(),
        end_date TIMESTAMP NOT NULL DEFAULT now(),
        amount_paid DECIMAL(10,2),
        transaction_id VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ap_vendor_status ON active_plans(vendor_id, status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ap_target_status ON active_plans(target_id, status);`);
    try { await client.query(`ALTER TABLE active_plans ADD CONSTRAINT fk_ap_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;`); } catch(e) { console.log('  FK:', e.message); }
    try { await client.query(`ALTER TABLE active_plans ADD CONSTRAINT fk_ap_plan FOREIGN KEY (plan_id) REFERENCES pricing_plans(id) ON DELETE SET NULL;`); } catch(e) { console.log('  FK:', e.message); }
    try { await client.query(`ALTER TABLE active_plans ADD CONSTRAINT fk_ap_target FOREIGN KEY (target_id) REFERENCES businesses(id) ON DELETE SET NULL;`); } catch(e) { console.log('  FK:', e.message); }
    console.log('✓ active_plans CREATED');
  } else {
    console.log('- active_plans already exists');
  }

  // ─── qa_questions ───
  if (!allTables.includes('qa_questions')) {
    await client.query(`
      CREATE TABLE qa_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL,
        user_id UUID NOT NULL,
        question TEXT NOT NULL,
        status qa_status_enum NOT NULL DEFAULT 'pending',
        is_answered BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_qa_q_business ON qa_questions(business_id);`);
    try { await client.query(`ALTER TABLE qa_questions ADD CONSTRAINT fk_qa_q_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;`); } catch(e) {}
    try { await client.query(`ALTER TABLE qa_questions ADD CONSTRAINT fk_qa_q_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`); } catch(e) {}
    console.log('✓ qa_questions CREATED');
  } else {
    console.log('- qa_questions already exists');
  }

  // ─── qa_answers ───
  if (!allTables.includes('qa_answers')) {
    await client.query(`
      CREATE TABLE qa_answers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id UUID NOT NULL,
        user_id UUID NOT NULL,
        answer TEXT NOT NULL,
        is_vendor_answer BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_qa_a_question ON qa_answers(question_id);`);
    try { await client.query(`ALTER TABLE qa_answers ADD CONSTRAINT fk_qa_a_question FOREIGN KEY (question_id) REFERENCES qa_questions(id) ON DELETE CASCADE;`); } catch(e) {}
    try { await client.query(`ALTER TABLE qa_answers ADD CONSTRAINT fk_qa_a_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`); } catch(e) {}
    console.log('✓ qa_answers CREATED');
  } else {
    console.log('- qa_answers already exists');
  }

  // ─── Final status check ───
  const allAfter = (await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
  )).rows.map(r => r.table_name);

  const required = ['pricing_plans', 'active_plans', 'affiliate_referrals', 'qa_questions', 'qa_answers', 'offer_events', 'promotion_bookings', 'promotion_pricing_rules'];
  console.log('\n── Final Status ──');
  for (const t of required) {
    console.log(allAfter.includes(t) ? `  ✓ ${t}` : `  ✗ MISSING: ${t}`);
  }

  await client.end();
  console.log('\nDone!');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
