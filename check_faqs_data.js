const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkData() {
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
        const res = await client.query(`
            SELECT id, name, faqs 
            FROM businesses 
            WHERE faqs IS NOT NULL AND jsonb_array_length(faqs) > 0 
            LIMIT 5;
        `);
        console.log('--- Listings with FAQs ---');
        if (res.rows.length === 0) {
            console.log('No listings found with FAQs in the database.');
            
            // Let's check a few listings to see what their faqs column contains
            const res2 = await client.query(`SELECT id, name, faqs FROM businesses LIMIT 5;`);
            console.log('\n--- Sample listings (first 5) ---');
            res2.rows.forEach(r => console.log(`${r.name} (ID: ${r.id}): ${JSON.stringify(r.faqs)}`));
        } else {
            res.rows.forEach(r => console.log(`${r.name} (ID: ${r.id}): ${JSON.stringify(r.faqs)}`));
        }
    } catch (err) {
        console.error('Error connecting to DB:', err);
    } finally {
        await client.end();
    }
}

checkData();
