const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value.length > 0) {
                process.env[key.trim()] = value.join('=').trim();
            }
        });
    }
}
loadEnv();
// sddcvdcsdcdscsdc
async function migrate() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database for ...');

        // Add columns to users
        console.log('Adding trust score columns to users table...');
        const addColumnsQuery = `
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50,
            ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS helpful_votes_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS spam_flags_count INTEGER DEFAULT 0;
        `;
        await client.query(addColumnsQuery);
        console.log('✅ Columns added successfully.');

        console.log('🎉 Migration completed successfully!');

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
