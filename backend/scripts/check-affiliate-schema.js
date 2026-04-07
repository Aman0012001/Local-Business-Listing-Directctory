const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkSchema() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'affiliate_referrals'
            ORDER BY ordinal_position;
        `);
        console.log('Columns in affiliate_referrals:');
        console.table(res.rows);

        const typeExists = res.rows.some(r => r.column_name === 'type');
        if (!typeExists) {
            console.log('Column "type" is MISSING. Adding it now...');
            // Create enum type first if it doesn't exist
            try {
                await client.query("CREATE TYPE affiliate_referrals_type_enum AS ENUM ('subscription', 'signup')");
            } catch (e) {
                console.log('Type enum already exists or error:', e.message);
            }
            await client.query("ALTER TABLE affiliate_referrals ADD COLUMN type affiliate_referrals_type_enum DEFAULT 'subscription'");
            console.log('✅ Column "type" added successfully!');
        } else {
            console.log('Column "type" already exists.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
