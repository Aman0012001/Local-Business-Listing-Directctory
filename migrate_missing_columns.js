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

        // Add device_token to users
        console.log('Adding device_token to users...');
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS device_token text;
        `);

        // Add source to categories
        console.log('Adding source to categories...');
        // First check if the enum type exists or just use text for simplicity if it's missing
        await client.query(`
            ALTER TABLE categories ADD COLUMN IF NOT EXISTS source text DEFAULT 'admin';
        `);

        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
