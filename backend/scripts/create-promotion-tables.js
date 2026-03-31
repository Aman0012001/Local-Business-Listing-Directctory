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

  const queries = [
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    
    // Drop the wrong singular tables
    `DROP TABLE IF EXISTS "promotion_pricing_rule"`,
    `DROP TABLE IF EXISTS "promotion_booking"`,

    // Pre-create enums (with error handling in case they exist)
    `DO $$ BEGIN
        CREATE TYPE "promotion_placement_enum" AS ENUM ('homepage', 'category', 'listing');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;`,

    `DO $$ BEGIN
        CREATE TYPE "promotion_booking_status_enum" AS ENUM ('pending', 'active', 'expired', 'cancelled');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;`,

    `DO $$ BEGIN
        CREATE TYPE "offer_event_type_enum" AS ENUM ('offer', 'event');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;`,
    
    `CREATE TABLE IF NOT EXISTS "promotion_pricing_rules" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "placement" "promotion_placement_enum" NOT NULL,
      "pricePerHour" numeric(10,2) NOT NULL DEFAULT '0',
      "pricePerDay" numeric(10,2) NOT NULL DEFAULT '0',
      "is_active" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_pricing_rules_id" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_pricing_rules_placement" UNIQUE ("placement")
    )`,

    `CREATE TABLE IF NOT EXISTS "promotion_bookings" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "vendor_id" uuid NOT NULL,
      "offer_event_id" uuid NOT NULL,
      "type" "offer_event_type_enum" NOT NULL DEFAULT 'offer',
      "placements" jsonb NOT NULL DEFAULT '[]',
      "start_time" TIMESTAMP NOT NULL,
      "end_time" TIMESTAMP NOT NULL,
      "duration_hours" integer NOT NULL,
      "total_price" numeric(10,2) NOT NULL DEFAULT '0',
      "status" "promotion_booking_status_enum" NOT NULL DEFAULT 'pending',
      "stripe_session_id" character varying,
      "payment_intent_id" character varying,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_bookings_id" PRIMARY KEY ("id")
    )`
  ];

  for (const query of queries) {
    try {
      await client.query(query);
      console.log('✅ Query executed successfully');
    } catch (e) {
      console.error('❌ Error executing query:', e.message);
    }
  }

  await client.end();
  console.log('Done.');
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
