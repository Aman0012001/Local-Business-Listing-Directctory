const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function patchSchema() {
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
        console.log('🔌 Connected to database');

        // 1. Add followers_count to businesses table
        console.log('🔨 Adding followers_count to businesses table...');
        await client.query('ALTER TABLE businesses ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0');
        console.log('✅ Added followers_count column');

        // 2. Create follows table
        console.log('🔨 Creating follows table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS follows (
                user_id UUID NOT NULL,
                business_id UUID NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, business_id),
                CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT fk_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created follows table');

    } catch (error) {
        console.error('❌ Error applying patch:', error);
    } finally {
        await client.end();
        console.log('🔌 Connection closed');
    }
}

patchSchema();
