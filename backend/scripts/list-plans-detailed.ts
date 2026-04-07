
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listPlans() {
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

        const plans = await connection.query("SELECT id, name, type, price FROM pricing_plans");
        console.log('--- Pricing Plans ---');
        plans.forEach((p: any) => console.log(`${p.id} | ${p.name} | ${p.type} | ${p.price}`));

        const oldPlans = await connection.query("SELECT id, name, price FROM subscription_plans");
        console.log('--- Old Subscription Plans ---');
        oldPlans.forEach((p: any) => console.log(`${p.id} | ${p.name} | ${p.price}`));

        await connection.close();
    } catch (err) {
        console.error(err);
    }
}

listPlans();
