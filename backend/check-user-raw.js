
const { Client } = require('pg');
require('dotenv').config();

async function checkUser() {
    const email = 'amanjeetthakur644@gmail.com';
    console.log(`Checking user: ${email}`);

    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();
        console.log('Database connected.');

        // Get User
        const userRes = await client.query('SELECT id, "full_name" FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            console.log('User not found.');
            return;
        }
        const user = userRes.rows[0];
        console.log(`User ID: ${user.id}, FullName: ${user.full_name}`);

        // Get Vendor
        const vendorRes = await client.query('SELECT id, "business_name" FROM vendors WHERE user_id = $1', [user.id]);
        if (vendorRes.rows.length === 0) {
            console.log('Vendor not found.');
            return;
        }
        const vendor = vendorRes.rows[0];
        console.log(`Vendor ID: ${vendor.id}, Business: ${vendor.business_name}`);

        // Get Subscriptions (Old)
        const subRes = await client.query(`
            SELECT s.*, p.name as plan_name 
            FROM subscriptions s 
            LEFT JOIN subscription_plans p ON s.plan_id = p.id 
            WHERE s.vendor_id = $1 
            ORDER BY s.created_at DESC`, [vendor.id]);
        console.log('\n--- OLD SYSTEM SUBSCRIPTIONS ---');
        subRes.rows.forEach(s => {
            console.log(`Plan: ${s.plan_name}, Status: ${s.status}, Start: ${s.start_date}, End: ${s.end_date}, Created: ${s.created_at}`);
        });

        // Get ActivePlans (New)
        const activeRes = await client.query(`
            SELECT a.*, p.name as plan_name 
            FROM active_plans a 
            LEFT JOIN pricing_plans p ON a.plan_id = p.id 
            WHERE a.vendor_id = $1 
            ORDER BY a.created_at DESC`, [vendor.id]);
        console.log('\n--- NEW SYSTEM ACTIVE PLANS ---');
        activeRes.rows.forEach(p => {
            console.log(`Plan: ${p.plan_name}, Status: ${p.status}, Start: ${p.start_date}, End: ${p.end_date}, Created: ${p.created_at}`);
        });

        // Get Transactions
        const txRes = await client.query(`
            SELECT * FROM transactions 
            WHERE vendor_id = $1 
            ORDER BY created_at DESC`, [vendor.id]);
        console.log('\n--- TRANSACTIONS (Billing) ---');
        txRes.rows.forEach(t => {
            console.log(`ID: ${t.id}, Amount: ${t.amount}, Status: ${t.status}, Gateway: ${t.payment_gateway}, Created: ${t.created_at}`);
            if (t.metadata) {
                console.log(`   Metadata: ${JSON.stringify(t.metadata)}`);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

checkUser();
