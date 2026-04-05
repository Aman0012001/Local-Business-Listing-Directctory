
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkUserSSS() {
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

        // 1. Find user "sss"
        const users = await connection.query("SELECT id, email, full_name FROM users WHERE email LIKE '%sss%' OR full_name LIKE '%sss%'");
        if (users.length === 0) {
            console.log('No user found');
            await connection.close();
            return;
        }
        const user = users[0];
        console.log(`User: ${user.full_name} (${user.email}) ID: ${user.id}`);

        // 2. Find vendor
        const vendors = await connection.query("SELECT id FROM vendors WHERE user_id = $1", [user.id]);
        if (vendors.length === 0) {
            console.log('No vendor found');
            await connection.close();
            return;
        }
        const vendorId = vendors[0].id;
        console.log(`Vendor ID: ${vendorId}`);

        // 3. active_plans
        const activePlans = await connection.query(`
            SELECT ap.id, p.name, ap.status, ap.end_date 
            FROM active_plans ap 
            JOIN pricing_plans p ON ap.plan_id = p.id 
            WHERE ap.vendor_id = $1
        `, [vendorId]);
        console.log('--- Active Plans ---');
        activePlans.forEach((p: any) => console.log(`${p.name} | ${p.status} | ${p.end_date}`));

        // 4. subscriptions
        const subs = await connection.query(`
            SELECT s.id, p.name, s.status, s.end_date 
            FROM subscriptions s 
            JOIN subscription_plans p ON s.plan_id = p.id 
            WHERE s.vendor_id = $1
        `, [vendorId]);
        console.log('--- Subscriptions ---');
        subs.forEach((s: any) => console.log(`${s.name} | ${s.status} | ${s.end_date}`));

        // 5. referrals 
        const affiliates = await connection.query("SELECT id FROM affiliates WHERE user_id = $1", [user.id]);
        if (affiliates[0]) {
            const referrals = await connection.query(`
                SELECT r.id, r.referred_user_id, r.status, u.email as referred_email
                FROM affiliate_referrals r
                JOIN users u ON r.referred_user_id = u.id
                WHERE r.affiliate_id = $1
            `, [affiliates[0].id]);
            console.log('--- Referrals Given ---');
            referrals.forEach((r: any) => console.log(`${r.referred_email} | ${r.status}`));
        }

        await connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkUserSSS();
