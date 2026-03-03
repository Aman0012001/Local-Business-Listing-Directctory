const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function addColumns() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();
        console.log('Database connected');

        // Add city column
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)');
        console.log('Added city column');

        // Add state column
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100)');
        console.log('Added state column');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

addColumns();
