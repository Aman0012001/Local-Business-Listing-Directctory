const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkSpecific() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const slug = 'karachi-auto-care-workshop-mmgs0upa';
        const res = await client.query(`SELECT id, name, faqs FROM businesses WHERE slug = $1`, [slug]);
        console.log('--- Specific Listing ---');
        console.log(JSON.stringify(res.rows[0], null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkSpecific();
