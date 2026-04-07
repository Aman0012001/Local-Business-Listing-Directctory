
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkUserStats() {
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

        // 1. Find the user
        const users = await connection.query("SELECT id, email, full_name, role FROM users WHERE email LIKE '%sss%' OR full_name LIKE '%sss%'");
        if (users.length === 0) {
            console.log('No user found with "sss"');
            await connection.close();
            return;
        }
        
        const user = users[0];
        console.log(`Found User: ${user.full_name} (${user.email}) ID: ${user.id}`);

        // 2. Find their vendor
        const vendors = await connection.query("SELECT id FROM vendors WHERE user_id = $1", [user.id]);
        const vendor = vendors[0];
        if (!vendor) {
            console.log('User is not a vendor');
            await connection.close();
            return;
        }
        console.log(`Vendor ID: ${vendor.id}`);

        // 3. Check referrals
        const affiliates = await connection.query("SELECT id FROM affiliates WHERE user_id = $1", [user.id]);
        if (affiliates[0]) {
            const referrals = await connection.query("SELECT status, type, created_at FROM affiliate_referrals WHERE affiliate_id = $1", [affiliates[0].id]);
            console.log('--- Referrals ---');
            console.table(referrals);
        }

        // 4. Check active plans (New System)
        const activePlans = await connection.query(`
            SELECT ap.id, p.name, ap.status, ap.start_date, ap.end_date 
            FROM active_plans ap 
            JOIN pricing_plans p ON ap.plan_id = p.id 
            WHERE ap.vendor_id = $1
        `, [vendor.id]);
        console.log('--- Active Plans (New System) ---');
        console.table(activePlans);

        // 5. Check subscriptions (Old System)
        const subscriptions = await connection.query(`
            SELECT s.id, p.name, s.status, s.start_date, s.end_date 
            FROM subscriptions s 
            JOIN subscription_plans p ON s.plan_id = p.id 
            WHERE s.vendor_id = $1
        `, [vendor.id]);
        console.log('--- Subscriptions (Old System) ---');
        console.table(subscriptions);

        await connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUserStats();
