const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function updateSchema() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Check if featured_until exists
        const checkFeaturedUntil = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'offer_events' AND column_name = 'featured_until';
        `);

        if (checkFeaturedUntil.rows.length === 0) {
            console.log('Adding featured_until column...');
            await client.query('ALTER TABLE offer_events ADD COLUMN featured_until TIMESTAMP;');
            console.log('Column featured_until added.');
        } else {
            console.log('Column featured_until already exists.');
        }

        // Check if pricing_id exists
        const checkPricingId = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'offer_events' AND column_name = 'pricing_id';
        `);

        if (checkPricingId.rows.length === 0) {
            console.log('Adding pricing_id column...');
            await client.query('ALTER TABLE offer_events ADD COLUMN pricing_id UUID;');
            console.log('Column pricing_id added.');
        } else {
            console.log('Column pricing_id already exists.');
        }

        console.log('Schema update complete.');
    } catch (err) {
        console.error('Error updating schema:', err.stack);
    } finally {
        await client.end();
    }
}

updateSchema();
