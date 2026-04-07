import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Use backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function cleanup() {
    const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_SSL } = process.env;
    
    if (!DB_HOST || !DB_USERNAME || !DB_PASSWORD || !DB_DATABASE) {
        console.error('❌ Database credentials not found in backend/.env');
        process.exit(1);
    }

    const client = new Client({
        host: DB_HOST,
        port: parseInt(DB_PORT || '5432'),
        user: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        console.log('🚀 Connected to database for cleanup...');

        // 1. Find if Free plan exists (SubscriptionPlan)
        const freePlanRes = await client.query("SELECT id FROM subscription_plans WHERE name = 'Free' LIMIT 1");
        const freePlanId = freePlanRes.rows[0]?.id;

        if (freePlanId) {
            console.log(`✅ Found Free plan (SubscriptionPlan): ${freePlanId}`);
            
            // 2. Migrate active subscriptions from Basic to Free
            // Basic Plan ID: 00000000-0000-0000-0000-000000000003
            const basicPlanId = '00000000-0000-0000-0000-000000000003';
            const migrateRes = await client.query(
                'UPDATE subscriptions SET plan_id = $1, amount = 0 WHERE plan_id = $2 AND status = \'active\'',
                [freePlanId, basicPlanId]
            );
            console.log(`✅ Migrated ${migrateRes.rowCount} active subscriptions from Basic to Free.`);
        } else {
            console.warn('⚠️ Warning: Free plan not found in subscription_plans. Skipping migration.');
        }

        // 3. Delete Basic plan from subscription_plans
        const delSubPlan = await client.query(
            "DELETE FROM subscription_plans WHERE name = 'Basic' OR id = '00000000-0000-0000-0000-000000000003'"
        );
        console.log(`✅ Deleted ${delSubPlan.rowCount} records from subscription_plans.`);

        // 4. Delete Basic plan from pricing_plans
        const delPricePlan = await client.query(
            "DELETE FROM pricing_plans WHERE name = 'Basic'"
        );
        console.log(`✅ Deleted ${delPricePlan.rowCount} records from pricing_plans.`);

        console.log('🎉 Cleanup completed successfully!');

    } catch (err: any) {
        console.error('❌ Error during cleanup:', err.message || err);
    } finally {
        await client.end();
    }
}

cleanup();
