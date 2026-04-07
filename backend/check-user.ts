
import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { Vendor } from './src/entities/vendor.entity';
import { Transaction } from './src/entities/transaction.entity';
import { Subscription } from './src/entities/subscription.entity';
import { ActivePlan } from './src/entities/active-plan.entity';
import { SubscriptionPlan } from './src/entities/subscription-plan.entity';
import { PricingPlan } from './src/entities/pricing-plan.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkUser() {
    const email = 'amanjeetthakur644@gmail.com';
    console.log(`Checking user: ${email}`);

    const AppDataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        entities: [User, Vendor, Transaction, Subscription, ActivePlan, SubscriptionPlan, PricingPlan],
        synchronize: false,
        logging: false,
    });

    try {
        await AppDataSource.initialize();
        console.log('Database connected.');

        const userRepo = AppDataSource.getRepository(User);
        const vendorRepo = AppDataSource.getRepository(Vendor);
        const txRepo = AppDataSource.getRepository(Transaction);
        const subRepo = AppDataSource.getRepository(Subscription);
        const activePlanRepo = AppDataSource.getRepository(ActivePlan);

        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            console.log('User not found.');
            return;
        }
        console.log(`User ID: ${user.id}, FullName: ${user.fullName}`);

        const vendor = await vendorRepo.findOne({ where: { userId: user.id } });
        if (!vendor) {
            console.log('Vendor not found.');
            return;
        }
        console.log(`Vendor ID: ${vendor.id}, Business: ${vendor.businessName}`);

        const subs = await subRepo.find({ 
            where: { vendorId: vendor.id },
            relations: ['plan'],
            order: { createdAt: 'DESC' }
        });
        console.log('\n--- OLD SYSTEM SUBSCRIPTIONS ---');
        subs.forEach(s => {
            console.log(`Plan: ${s.plan?.name}, Status: ${s.status}, Start: ${s.startDate}, End: ${s.endDate}, Created: ${s.createdAt}`);
        });

        const activePlans = await activePlanRepo.find({
            where: { vendorId: vendor.id },
            relations: ['plan'],
            order: { createdAt: 'DESC' }
        });
        console.log('\n--- NEW SYSTEM ACTIVE PLANS ---');
        activePlans.forEach(p => {
            console.log(`Plan: ${p.plan?.name}, Status: ${p.status}, Start: ${p.startDate}, End: ${p.endDate}, Created: ${p.createdAt}`);
        });

        const txs = await txRepo.find({
            where: { vendorId: vendor.id },
            order: { createdAt: 'DESC' }
        });
        console.log('\n--- TRANSACTIONS (Billing) ---');
        txs.forEach(t => {
            console.log(`ID: ${t.id}, Amount: ${t.amount}, Status: ${t.status}, Gateway: ${t.paymentGateway}, Created: ${t.createdAt}`);
            if (t.metadata) {
                console.log(`   Metadata: ${JSON.stringify(t.metadata)}`);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

checkUser();
