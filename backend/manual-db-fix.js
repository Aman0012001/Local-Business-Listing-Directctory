const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function fix() {
    console.log('Connecting to database...');
    const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected.');

        console.log('Adding columns to businesses...');
        await client.query(`
            ALTER TABLE businesses 
            ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
        `);
        console.log('✅ Column is_featured added or already exists in businesses.');

        console.log('Creating index for businesses...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS "IDX_businesses_is_featured" ON businesses(is_featured);
        `);
        console.log('✅ Index created for businesses.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

fix();
