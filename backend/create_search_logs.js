const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function run() {
    const user = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT;
    const database = process.env.DB_DATABASE;
    
    console.log(`Connecting to ${host}:${port}/${database}`);
    const client = new Client({
        host,
        port,
        user,
        password,
        database,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS search_logs (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                keyword character varying NOT NULL,
                normalized_keyword character varying NOT NULL,
                user_id uuid REFERENCES users(id) ON DELETE SET NULL,
                searched_at timestamp without time zone DEFAULT now() NOT NULL,
                city character varying,
                category_slug character varying,
                latitude numeric(10,8),
                longitude numeric(11,8),
                user_agent text,
                ip_address character varying
            );
            
            CREATE INDEX IF NOT EXISTS "IDX_search_logs_keyword" ON search_logs (keyword);
            CREATE INDEX IF NOT EXISTS "IDX_search_logs_normalized_keyword" ON search_logs (normalized_keyword);
            CREATE INDEX IF NOT EXISTS "IDX_search_logs_user_id" ON search_logs (user_id);
            CREATE INDEX IF NOT EXISTS "IDX_search_logs_searched_at" ON search_logs (searched_at);
            CREATE INDEX IF NOT EXISTS "IDX_search_logs_city" ON search_logs (city);
        `);
        console.log("Table search_logs created successfully");
        
        await client.query(`
            ALTER TABLE IF EXISTS "notifications"
            ADD COLUMN IF NOT EXISTS "priority" character varying DEFAULT 'normal';
        `);
        console.log("Column priority added to notifications successfully");

    } catch (e) {
        console.error("Error creating table:", e);
    } finally {
        await client.end();
    }
}

run();
