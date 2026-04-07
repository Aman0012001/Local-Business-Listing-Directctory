const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function check() {
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
        console.log('Connected to database.');

        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'search_logs';
        `);
        
        console.log('Columns in search_logs:');
        res.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type})`);
        });

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await client.end();
    }
}

check();
