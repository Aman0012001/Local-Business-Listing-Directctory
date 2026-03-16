const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function migrate() {
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

        console.log('Adding missing columns to search_logs...');
        await client.query(`
            ALTER TABLE search_logs 
            ADD COLUMN IF NOT EXISTS category_slug character varying,
            ADD COLUMN IF NOT EXISTS user_agent text,
            ADD COLUMN IF NOT EXISTS ip_address character varying;
        `);

        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
