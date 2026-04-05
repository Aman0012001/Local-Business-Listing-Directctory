
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function inspectPlans() {
    try {
        const connection = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            ssl: { rejectUnauthorized: false },
            entities: [path.join(__dirname, '../src/entities/*.entity.ts')],
        });

        console.log('Connected to database');

        const pricingPlans = await connection.query('SELECT id, name, type, price FROM pricing_plans');
        console.log('--- Pricing Plans (New System) ---');
        console.table(pricingPlans);

        const subscriptionPlans = await connection.query('SELECT id, name, plan_type, price FROM subscription_plans');
        console.log('--- Subscription Plans (Old System) ---');
        console.table(subscriptionPlans);

        await connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectPlans();
