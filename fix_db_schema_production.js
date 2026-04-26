const { Client } = require('pg');
require('dotenv').config();

async function fixSchema() {
    const dbUrl = process.env.DATABASE_URL;
    const config = dbUrl ? { connectionString: dbUrl } : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    };

    if (!dbUrl && !process.env.DB_HOST) {
        console.error('❌ Database credentials not found in .env');
        process.exit(1);
    }

    console.log('🔌 Connecting to database...');
    const client = new Client({
        ...config,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        console.log('🛠️ Checking and fixing schema...');

        // 1. Check if stripe_price_id exists in subscription_plans
        const checkColumnQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'subscription_plans' AND column_name = 'stripe_price_id';
        `;
        const res = await client.query(checkColumnQuery);

        if (res.rows.length === 0) {
            console.log('➕ Adding missing column: stripe_price_id to subscription_plans');
            await client.query('ALTER TABLE subscription_plans ADD COLUMN stripe_price_id VARCHAR(255);');
            console.log('✅ Column added successfully');
        } else {
            console.log('✅ Column stripe_price_id already exists');
        }

        // 2. Add other missing columns
        const checkDashboardFeatures = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'subscription_plans' AND column_name = 'dashboard_features';
        `;
        const res2 = await client.query(checkDashboardFeatures);
        if (res2.rows.length === 0) {
            console.log('➕ Adding missing column: dashboard_features to subscription_plans');
            await client.query('ALTER TABLE subscription_plans ADD COLUMN dashboard_features JSONB DEFAULT \'{}\';');
        }

        console.log('🎉 Schema fix completed successfully');
    } catch (err) {
        console.error('❌ Error fixing schema:', err);
    } finally {
        await client.end();
    }
}

fixSchema();
