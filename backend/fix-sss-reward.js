const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    await client.connect();
    console.log('FINAL FIX for user "sss" account based on 2 converted referrals...');
    
    try {
        const USER_EMAIL = 'sss@gmail.com';
        const SUB_PLAN_BASIC_ID = '5cfaf40b-4adb-4540-a9ee-c9a17a30b740'; // subscription_plans
        const PRICING_PLAN_BASIC_ID = '82ffabe2-2881-4e16-b7f3-5b750eac1b74'; // pricing_plans

        // 1. Find user
        const userRes = await client.query('SELECT id FROM users WHERE email ILIKE $1 LIMIT 1', [USER_EMAIL]);
        const userId = userRes.rows[0]?.id;
        if (!userId) return console.log('User not found.');

        // 2. Find vendor
        const vendorRes = await client.query('SELECT id FROM vendors WHERE user_id = $1 LIMIT 1', [userId]);
        const vendorId = vendorRes.rows[0]?.id;
        if (!vendorId) return console.log('Vendor not found.');

        // 3. Create active subscription for 30 days
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);

        // Deactivate existing subscriptions
        await client.query("UPDATE subscriptions SET status = 'expired' WHERE vendor_id = $1 AND status = 'active'", [vendorId]);

        const subRes = await client.query(`
            INSERT INTO subscriptions (id, vendor_id, plan_id, status, start_date, end_date, amount, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, 'active', $3, $4, 0.00, NOW(), NOW())
            RETURNING id
        `, [vendorId, SUB_PLAN_BASIC_ID, startDate, endDate]);
        console.log('Created active Basic subscription (ID:', subRes.rows[0].id, ')');

        // 4. Update or Create Active Plans record (this one uses pricing_plans.id)
        const activeRes = await client.query('SELECT id FROM active_plans WHERE vendor_id = $1', [vendorId]);
        if (activeRes.rows.length > 0) {
            await client.query(`
                UPDATE active_plans 
                SET plan_id = $1, status = 'active', start_date = $2, end_date = $3, updated_at = NOW()
                WHERE vendor_id = $4
            `, [PRICING_PLAN_BASIC_ID, startDate, endDate, vendorId]);
            console.log('Updated existing active_plans entry');
        } else {
            await client.query(`
                INSERT INTO active_plans (id, vendor_id, plan_id, status, start_date, end_date, created_at, updated_at)
                VALUES (gen_random_uuid(), $1, $2, 'active', $3, $4, NOW(), NOW())
            `, [vendorId, PRICING_PLAN_BASIC_ID, startDate, endDate]);
            console.log('Created new active_plans entry');
        }

        console.log('User sss account successfully fixed with 1 month Basic plan.');

    } catch (e) {
        console.error('ERROR during fix:', e.message);
    } finally {
        await client.end();
    }
}
main();
