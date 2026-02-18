const { Client } = require('pg');
require('dotenv').config();

async function applyFix() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'business_saas_db',
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        console.log('⏳ Adding "firebase_uid" column to "users" table...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;
        `);
        console.log('✅ "firebase_uid" column added successfully!');

        // Also ensure roles are correct just in case (though we checked)
        // We can't easily modify enums if they already exist without a lot of logic,
        // but since vendor is there, it's fine.

        console.log('\n✨ Database fix applied successfully!');

    } catch (err) {
        console.error('❌ Error applying fix:', err.message);
    } finally {
        await client.end();
    }
}

applyFix();
