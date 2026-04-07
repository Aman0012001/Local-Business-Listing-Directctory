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
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('--- Columns in users table ---');
        res.rows.forEach(r => console.log(r.column_name));

        const catRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'categories';
        `);
        console.log('--- Columns in categories table ---');
        catRes.rows.forEach(r => console.log(r.column_name));
    } catch (err) {
        console.error('Error connecting to DB:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
