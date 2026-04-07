const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkSchema() {
    console.log('Connecting to:', process.env.DB_HOST);
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
        console.log('Columns in users table:');
        console.log(res.rows.map(r => r.column_name).sort().join(', '));
    } catch (err) {
        console.error('Error connecting to DB:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
