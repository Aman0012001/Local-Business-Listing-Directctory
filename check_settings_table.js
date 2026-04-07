const { Client } = require('pg');
require('dotenv').config({ path: 'e:/localweb/Local-Business-Listing-Directctory/backend/.env' });

async function checkTable() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
        console.log("Connected to DB.");

        const res = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE  table_schema = 'public'
                AND    table_name   = 'system_settings'
            );
        `);
        console.log("Table 'system_settings' exists:", res.rows[0].exists);

        if (!res.rows[0].exists) {
            console.log("Creating table...");
            await client.query(`
                CREATE TABLE "system_settings" (
                    "key" character varying NOT NULL,
                    "value" text NOT NULL,
                    "description" text,
                    "group" character varying NOT NULL DEFAULT 'general',
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_system_settings_key" PRIMARY KEY ("key")
                );
            `);
            console.log("Table 'system_settings' created successfully.");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

checkTable();
