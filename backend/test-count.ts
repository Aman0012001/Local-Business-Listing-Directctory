import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Subscription } from './src/entities/subscription.entity';

dotenv.config({ path: __dirname + '/.env' });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
    entities: [Subscription, __dirname + '/src/entities/*.ts'],
    synchronize: false,
    logging: true,
});

async function run() {
    await AppDataSource.initialize();
    
    const id = '79e7838b-93ba-44db-a0cc-65af6ca493da';

    // Test 1: By planId column definition
    const count1 = await AppDataSource.getRepository(Subscription).count({
        where: { planId: id }
    });
    console.log('Count with planId:', count1);

    // Test 2: By plan relation
    const count2 = await AppDataSource.getRepository(Subscription).count({
        where: { plan: { id } }
    });
    console.log('Count with plan { id }:', count2);

    process.exit(0);
}

run().catch(console.error);
