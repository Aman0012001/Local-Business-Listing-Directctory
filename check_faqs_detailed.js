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
            LIMIT 50;
        `);
        console.log('--- Listings with FAQs ---');
        res.rows.forEach(r => {
            const valid = r.faqs.filter(f => f.question && f.answer);
            console.log(`${r.name} (ID: ${r.id}): Total: ${r.faqs.length}, Valid: ${valid.length}`);
            if (r.faqs.length > 0) {
                console.log('  First FAQ Sample:', JSON.stringify(r.faqs[0]));
            }
        });
    } catch (err) {
        console.error('Error connecting to DB:', err);
    } finally {
        await client.end();
    }
}

checkData();
