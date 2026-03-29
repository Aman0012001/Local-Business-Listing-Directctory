
const { Client } = require('pg');
require('dotenv').config();

async function fixAman() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();
        console.log('Database connected.');

        // Update correct expiry for Aman
        const res = await client.query(
            "UPDATE subscriptions SET end_date = $1 WHERE id = $2", 
            ['2026-04-24 18:30:00', 'b1a7b350-c21c-47ab-ad0c-8f780704481d']
        );
        
        console.log(`Updated Rows: ${res.rowCount}`);

        // Verify
        const verify = await client.query(
            "SELECT id, status, start_date, end_date FROM subscriptions WHERE id = $1",
            ['b1a7b350-c21c-47ab-ad0c-8f780704481d']
        );
        console.log('Verification After Fix:', verify.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

fixAman();
