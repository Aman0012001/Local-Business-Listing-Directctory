const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkSchema() {
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
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'businesses'
            ORDER BY column_name;
        `);
        console.log('--- Columns in businesses table ---');
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
    } catch (err) {
        console.error('Error connecting to DB:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
