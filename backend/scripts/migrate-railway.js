const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected to Railway database.');

        console.log('Adding is_featured column to categories table...');
        await client.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;');
        
        console.log('Creating index on is_featured...');
        // PostgreSQL doesn't support IF NOT EXISTS for CREATE INDEX in all versions directly with query, 
        // but it does support it in modern versions (9.5+). Railway is modern.
        await client.query('CREATE INDEX IF NOT EXISTS "IDX_FEATURED_CATEGORY" ON categories (is_featured);');

        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
