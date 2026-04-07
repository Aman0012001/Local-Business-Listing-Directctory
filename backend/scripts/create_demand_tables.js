const { Client } = require('pg');
require('dotenv').config({ path: 'backend/.env' });

async function createDemandTables() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Create search_logs table
        console.log('Creating search_logs table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS search_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                keyword VARCHAR(255) NOT NULL,
                normalized_keyword VARCHAR(255) NOT NULL,
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                city VARCHAR(255),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8)
            )
        `);

        // Create notification_logs table
        console.log('Creating notification_logs table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS notification_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
                keyword VARCHAR(255) NOT NULL,
                status VARCHAR(255) DEFAULT 'sent',
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes
        console.log('Creating indexes...');
        await client.query('CREATE INDEX IF NOT EXISTS idx_search_logs_keyword ON search_logs(keyword)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_search_logs_normalized_keyword ON search_logs(normalized_keyword)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_search_logs_searched_at ON search_logs(searched_at)');

        await client.query('CREATE INDEX IF NOT EXISTS idx_notification_logs_vendor_id ON notification_logs(vendor_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_notification_logs_keyword ON notification_logs(keyword)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at)');

        console.log('Demand tables and indexes created successfully!');
    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        await client.end();
    }
}

createDemandTables();
