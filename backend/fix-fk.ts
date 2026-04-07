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
    
    console.log('Altering plan_id to be nullable...');
    await AppDataSource.query(`ALTER TABLE "subscriptions" ALTER COLUMN "plan_id" DROP NOT NULL;`);
    
    console.log('Dropping old strict foreign key...');
    await AppDataSource.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc";`);
    
    console.log('Adding new onDelete SET NULL foreign key...');
    await AppDataSource.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE SET NULL;`);
    
    console.log('Database altered successfully.');
    process.exit(0);
}

run().catch(console.error);
