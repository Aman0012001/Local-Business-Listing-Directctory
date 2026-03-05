const { Client } = require('pg');

async function createOffersTable() {
    const client = new Client({
        host: '66.33.22.240',
        port: 45505,
        user: 'postgres',
        password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
        database: 'railway',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Create enum types if they don't exist
        await client.query(`
      DO $$ BEGIN
        CREATE TYPE offer_type AS ENUM ('offer', 'event');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        await client.query(`
      DO $$ BEGIN
        CREATE TYPE offer_status AS ENUM ('scheduled', 'active', 'expired');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        // Create the offer_events table
        await client.query(`
      CREATE TABLE IF NOT EXISTS offer_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type offer_type DEFAULT 'offer',
        offer_badge VARCHAR(255),
        image_url TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        expiry_date TIMESTAMP,
        status offer_status DEFAULT 'active',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_offer_events_vendor_id ON offer_events(vendor_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_offer_events_business_id ON offer_events(business_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_offer_events_status ON offer_events(status)');

        console.log('Table offer_events created successfully!');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await client.end();
    }
}

createOffersTable();
