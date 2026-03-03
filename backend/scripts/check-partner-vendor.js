const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function checkVendor() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();

        const userRes = await client.query('SELECT id FROM users WHERE email = $1', ['partner1@hyperlocal.com']);
        const userId = userRes.rows[0].id;
        console.log('User ID:', userId);

        const vendorRes = await client.query('SELECT * FROM vendors WHERE user_id = $1', [userId]);
        console.log('Vendor Record:', JSON.stringify(vendorRes.rows, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

checkVendor();
