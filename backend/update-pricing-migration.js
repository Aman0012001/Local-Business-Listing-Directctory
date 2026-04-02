const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.join('=').trim();
            }
        });
    }
}
loadEnv();

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
        console.log('Connected to database for migration...');

        // 1. Add columns to subscription_plans
        console.log('Adding columns to subscription_plans...');
        const addColumnsQuery = `
            ALTER TABLE subscription_plans 
            ADD COLUMN IF NOT EXISTS offer_price DECIMAL(10, 2) DEFAULT 0.00,
            ADD COLUMN IF NOT EXISTS event_price DECIMAL(10, 2) DEFAULT 0.00,
            ADD COLUMN IF NOT EXISTS page_price DECIMAL(10, 2) DEFAULT 0.00;
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
