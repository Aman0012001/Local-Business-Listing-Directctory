
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listAllPlanNames() {
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

        const pricingPlans = await connection.query('SELECT name, type FROM pricing_plans');
        console.log('--- Pricing Plans ---');
        pricingPlans.forEach(p => console.log(`- ${p.name} (${p.type})`));

        const subPlans = await connection.query('SELECT name FROM subscription_plans');
        console.log('--- Old Subscription Plans ---');
        subPlans.forEach(p => console.log(`- ${p.name}`));

        await connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

listAllPlanNames();
