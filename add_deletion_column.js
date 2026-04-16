const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function addDeletionColumn() {
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
        console.log('✅ Connected to database');

        console.log('⏳ Adding "deletion_scheduled_at" column to "users" table...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP;
        `);
        console.log('✅ "deletion_scheduled_at" column added successfully!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

addDeletionColumn();
