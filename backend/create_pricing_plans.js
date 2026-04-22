const { Client } = require('pg');
const c = new Client({
  host: '66.33.22.240', port: 45505, user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {
  console.log('Creating pricing_plans table...');

  // Use pricing_plans_type_enum (lowercase values) and pricing_plans_unit_enum
  await c.query(`
    CREATE TABLE IF NOT EXISTS pricing_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR NOT NULL,
      description TEXT,
      type pricing_plans_type_enum NOT NULL DEFAULT 'subscription',
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      duration INT NOT NULL DEFAULT 30,
      unit pricing_plans_unit_enum NOT NULL DEFAULT 'days',
      stripe_price_id VARCHAR,
      features JSONB DEFAULT '{}',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);
  console.log('✓ pricing_plans table created');

  // Create qa_questions if missing
  const qaQRes = await c.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='qa_questions'"
  );
  if (qaQRes.rows.length === 0) {
    // Check qa_status_enum values
    const qaEnumRes = await c.query(
      "SELECT e.enumlabel FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid WHERE t.typname='qa_status_enum' ORDER BY e.enumsortorder"
    );
    const firstVal = qaEnumRes.rows[0]?.enumlabel || 'pending';
    await c.query(`
      CREATE TABLE qa_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL,
        user_id UUID NOT NULL,
        question TEXT NOT NULL,
        status qa_status_enum NOT NULL DEFAULT '${firstVal}',
        is_answered BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await c.query('CREATE INDEX IF NOT EXISTS idx_qa_q_business ON qa_questions(business_id);');
    try { await c.query('ALTER TABLE qa_questions ADD CONSTRAINT fk_qa_q_biz FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;'); } catch(e) {}
    try { await c.query('ALTER TABLE qa_questions ADD CONSTRAINT fk_qa_q_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;'); } catch(e) {}
    console.log('✓ qa_questions created');
  } else {
    console.log('- qa_questions already exists');
  }

  // Create qa_answers if missing
  const qaARes = await c.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='qa_answers'"
  );
  if (qaARes.rows.length === 0) {
    await c.query(`
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
    await c.query('CREATE INDEX IF NOT EXISTS idx_qa_a_question ON qa_answers(question_id);');
    try { await c.query('ALTER TABLE qa_answers ADD CONSTRAINT fk_qa_a_question FOREIGN KEY (question_id) REFERENCES qa_questions(id) ON DELETE CASCADE;'); } catch(e) {}
    try { await c.query('ALTER TABLE qa_answers ADD CONSTRAINT fk_qa_a_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;'); } catch(e) {}
    console.log('✓ qa_answers created');
  } else {
    console.log('- qa_answers already exists');
  }

  // FK from active_plans to pricing_plans (may have failed earlier)
  try {
    await c.query('ALTER TABLE active_plans ADD CONSTRAINT fk_ap_plan FOREIGN KEY (plan_id) REFERENCES pricing_plans(id) ON DELETE SET NULL;');
    console.log('✓ active_plans -> pricing_plans FK added');
  } catch(e) { console.log('- active_plans FK skipped:', e.message); }

  // Final check
  const required = ['pricing_plans', 'active_plans', 'qa_questions', 'qa_answers', 'offer_events', 'promotion_bookings'];
  console.log('\n── Final Status ──');
  for (const t of required) {
    const r = await c.query("SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1", [t]);
    console.log(r.rows.length > 0 ? `  ✓ ${t}` : `  ✗ MISSING: ${t}`);
  }

  await c.end();
  console.log('\nDone!');
}).catch(e => { console.error('FATAL:', e.message); process.exit(1); });
