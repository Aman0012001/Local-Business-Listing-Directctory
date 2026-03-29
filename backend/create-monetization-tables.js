const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function createTables() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('--- CORRECTING MONETIZATION TABLES ---');

    // 1. Drop existing new tables to recreate with correct schema
    await client.query("DROP TABLE IF EXISTS active_plans");
    await client.query("DROP TABLE IF EXISTS pricing_plans");
    await client.query("DROP TYPE IF EXISTS pricing_plans_type_enum");
    await client.query("DROP TYPE IF EXISTS pricing_plans_unit_enum");
    await client.query("DROP TYPE IF EXISTS active_plans_status_enum");

    // 2. Create Enums with names matching Entity definition
    await client.query("CREATE TYPE pricing_plans_type_enum AS ENUM ('subscription', 'homepage_featured', 'category_featured', 'listing_boost')");
    await client.query("CREATE TYPE pricing_plans_unit_enum AS ENUM ('minutes', 'hours', 'days', 'months', 'years')");
    await client.query("CREATE TYPE active_plans_status_enum AS ENUM ('active', 'expired', 'cancelled')");

    // 3. Create PricingPlan Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pricing_plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type pricing_plans_type_enum NOT NULL DEFAULT 'subscription',
        price DECIMAL(10, 2) NOT NULL,
        duration INTEGER NOT NULL,
        unit pricing_plans_unit_enum NOT NULL DEFAULT 'days',
        stripe_price_id VARCHAR(255),
        features JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ pricing_plans table corrected.');

    // 4. Create ActivePlan Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS active_plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        plan_id UUID NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
        target_id UUID,
        status active_plans_status_enum NOT NULL DEFAULT 'active',
        start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP NOT NULL,
        amount_paid DECIMAL(10, 2),
        transaction_id VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ active_plans table corrected.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

createTables();
