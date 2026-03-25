import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/.env' });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
    synchronize: false,
    logging: true,
});

async function run() {
    await AppDataSource.initialize();
    console.log('DB Connected! Updating plans...');

    // Deactivate unused plans entirely to avoid confusion, instead of deleting them which breaks foreign keys
    await AppDataSource.query(`UPDATE subscription_plans SET is_active = false WHERE id NOT IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003')`);

    // Ensure proper enum values exist before using them
    try {
        await AppDataSource.query(`ALTER TYPE subscription_plans_plan_type_enum ADD VALUE IF NOT EXISTS 'basic'`);
    } catch(e) {}
    try {
        await AppDataSource.query(`ALTER TYPE subscription_plan_type_enum ADD VALUE IF NOT EXISTS 'basic'`);
    } catch(e) {}

    // Update the FREE Plan
    await AppDataSource.query(`
        UPDATE subscription_plans
        SET name = 'Free',
            plan_type = 'free',
            description = 'Essential tools for small local businesses starting out.',
            price = 0,
            billing_cycle = 'monthly',
            max_listings = 1,
            is_featured = false,
            is_active = true,
            dashboard_features = $1
        WHERE id = '00000000-0000-0000-0000-000000000001'
    `, [JSON.stringify({
        showListings: false,
        canAddListing: false,
        showSaved: false,
        showFollowing: false,
        showQueries: false,
        showLeads: false,
        showOffers: false,
        showReviews: false,
        showAnalytics: false,
        showChat: false,
        showBroadcast: false,
        maxKeywords: 0
    })]);

    // Update the PREMIUM / BASIC Plan (we'll call it Premium for the UI, or Basic? Based on user asking for 'Premium', let's set name to 'Premium', plan_type to 'premium' to be safe)
    await AppDataSource.query(`
        UPDATE subscription_plans
        SET name = 'Basic',
            plan_type = 'basic',
            description = 'Everything you need to dominate your local market.',
            price = 2000,
            billing_cycle = 'monthly',
            max_listings = 999,
            is_featured = true,
            is_active = true,
            dashboard_features = $1
        WHERE id = '00000000-0000-0000-0000-000000000003'
    `, [JSON.stringify({
        showListings: true,
        canAddListing: true,
        showLeads: true,
        showOffers: true,
        showReviews: true,
        showAnalytics: true,
        showSaved: true,
        showFollowing: true,
        showQueries: true,
        showChat: true,
        showBroadcast: true,
        maxKeywords: 10
    })]);

    const res = await AppDataSource.query(`SELECT * FROM subscription_plans`);
    console.log('Final Plans:', res);

    process.exit(0);
}

run().catch(console.error);
