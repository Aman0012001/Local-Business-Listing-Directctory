const { Client } = require('pg');
const client = new Client({
  host: '66.33.22.240',
  port: 45505,
  user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
  console.log('Connected to DB...');

  // 1. Create offer_type enum if not exists
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE offer_type_enum AS ENUM ('offer', 'event', 'page');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log('offer_type_enum ready');

  // 2. Create offer_status enum if not exists
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE offer_status_enum AS ENUM ('scheduled', 'active', 'expired');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log('offer_status_enum ready');

  // 3. Create offer_events table
  await client.query(`
    CREATE TABLE IF NOT EXISTS offer_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id UUID NOT NULL,
      business_id UUID NOT NULL,
      title VARCHAR NOT NULL,
      description TEXT,
      type offer_type_enum NOT NULL DEFAULT 'offer',
      offer_badge VARCHAR,
      image_url VARCHAR,
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      expiry_date TIMESTAMP,
      status offer_status_enum NOT NULL DEFAULT 'active',
      is_active BOOLEAN NOT NULL DEFAULT true,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      featured_until TIMESTAMP,
      placements JSONB NOT NULL DEFAULT '[]',
      highlights JSONB DEFAULT '[]',
      terms JSONB DEFAULT '[]',
      pricing_id UUID,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);
  console.log('offer_events table created');

  // 4. Create indexes
  await client.query(`CREATE INDEX IF NOT EXISTS idx_offer_events_vendor_id ON offer_events(vendor_id);`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_offer_events_business_id ON offer_events(business_id);`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_offer_events_status ON offer_events(status);`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_offer_events_is_featured ON offer_events(is_featured);`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_offer_events_placements ON offer_events USING GIN(placements);`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_offer_events_pricing_id ON offer_events(pricing_id);`);
  console.log('Indexes created');

  // 5. Add FK constraints (soft - won't fail if they already exist)
  try {
    await client.query(`
      ALTER TABLE offer_events 
        ADD CONSTRAINT fk_offer_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;
    `);
    console.log('FK vendor added');
  } catch(e) { console.log('FK vendor skipped:', e.message); }

  try {
    await client.query(`
      ALTER TABLE offer_events
        ADD CONSTRAINT fk_offer_business FOREIGN KEY (business_id) REFERENCES listings(id) ON DELETE CASCADE;
    `);
    console.log('FK business added');
  } catch(e) { console.log('FK business skipped:', e.message); }

  // 6. Also update promotion_bookings to reference offer_events if not done
  try {
    await client.query(`
      ALTER TABLE promotion_bookings
        ADD CONSTRAINT fk_booking_offer FOREIGN KEY (offer_event_id) REFERENCES offer_events(id) ON DELETE CASCADE;
    `);
    console.log('FK promotion_bookings -> offer_events added');
  } catch(e) { console.log('FK promotion_bookings skipped (might already exist):', e.message); }

  // Verify
  const verify = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'offer_events' ORDER BY ordinal_position"
  );
  console.log('\noffer_events table columns:');
  verify.rows.forEach(r => console.log(' -', r.column_name, ':', r.data_type));

  await client.end();
  console.log('\nDone!');
}).catch(e => console.error('Error:', e.message));
