const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function fixPlans() {
    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Activate all subscription_plans
        console.log('Activating all subscription_plans...');
        await client.query(`UPDATE subscription_plans SET is_active = true WHERE name IN ('Free', 'Basic', 'Standard', 'Premium');`);
        console.log('Subscription plans activated.');

        // 2. Create offer_event_pricing table if missing
        console.log('Checking for offer_event_pricing table...');
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'offer_event_pricing'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log('Creating offer_event_pricing table...');
            await client.query(`
                CREATE TYPE pricing_unit_enum AS ENUM ('minutes', 'hours', 'days');
                CREATE TYPE offer_type_enum AS ENUM ('offer', 'event');
                
                CREATE TABLE offer_event_pricing (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    type offer_type_enum NOT NULL DEFAULT 'offer',
                    name VARCHAR(255) NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    unit pricing_unit_enum NOT NULL DEFAULT 'hours',
                    duration INTEGER NOT NULL DEFAULT 1,
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
                );
                CREATE INDEX idx_offer_event_pricing_type ON offer_event_pricing(type);
            `);
            console.log('Table offer_event_pricing created.');
        } else {
            console.log('Table offer_event_pricing already exists.');
        }

        // 3. Seed offer_event_pricing
        console.log('Seeding offer_event_pricing...');
        const countCheck = await client.query('SELECT COUNT(*) FROM offer_event_pricing;');
        if (parseInt(countCheck.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO offer_event_pricing (type, name, price, unit, duration) VALUES
                ('offer', '1 Hour Featured', 10.00, 'hours', 1),
                ('offer', '24 Hours Premium', 50.00, 'hours', 24),
                ('offer', '7 Days Professional', 200.00, 'days', 7),
                ('event', 'Local Event Feature (1 Day)', 30.00, 'days', 1),
                ('event', 'Mega Event Promo (3 Days)', 80.00, 'days', 3);
            `);
            console.log('Offer/Event pricing seeded.');
        } else {
            console.log('Offer/Event pricing already has data.');
        }

        console.log('All plans fixed successfully.');
    } catch (err) {
        if (err.message.includes('already exists')) {
            console.warn('Note: Some types or indexes already exists, proceeding...');
        } else {
            console.error('Error fixing plans:', err.stack);
        }
    } finally {
        await client.end();
    }
}

fixPlans();
