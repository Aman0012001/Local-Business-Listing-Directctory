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
    logging: false,
});

async function run() {
    await AppDataSource.initialize();
    
    await AppDataSource.query(`
        UPDATE subscriptions 
        SET plan_id = '00000000-0000-0000-0000-000000000003'
        WHERE plan_id NOT IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003')
        AND status = 'active'
    `);
    
    console.log('Subscriptions Migrated successfully.');
    process.exit(0);
}

run().catch(console.error);
