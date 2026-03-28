const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL, // Common in many setups
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
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'businesses'
            ORDER BY column_name;
        `);
        console.log('--- Columns in businesses table ---');
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        // Also check if any listings have FAQs
        const faqRes = await client.query(`
            SELECT id, title, faqs FROM businesses WHERE faqs IS NOT NULL AND jsonb_array_length(faqs) > 0 LIMIT 5;
        `);
        console.log('\n--- Listings with FAQs ---');
        faqRes.rows.forEach(r => console.log(`${r.title} (ID: ${r.id}): ${JSON.stringify(r.faqs)}`));

    } catch (err) {
        console.error('Error connecting to DB:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
