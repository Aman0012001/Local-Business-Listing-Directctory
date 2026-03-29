const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    
    // Check vendor by email
    const vendorRes = await client.query(`
        SELECT v.id, u.email, v.business_name 
        FROM vendors v 
        JOIN users u ON v.user_id = u.id 
        WHERE u.email = 'amanjeetthakur644@gmail.com'
    `);
    
    if (vendorRes.rows.length === 0) {
        console.log("Vendor not found");
        await client.end();
        return;
    }
    
    const vendorId = vendorRes.rows[0].id;
    console.log(`Vendor ID: ${vendorId}`);
    
    // Check active subscriptions in OLD system
    const subRes = await client.query(`
        SELECT id, amount, status, end_date, plan_id 
        FROM subscriptions 
        WHERE vendor_id = $1 AND status = 'active'
    `, [vendorId]);
    
    console.log("Old System Subs:", subRes.rows);
    
    // Check active plans in NEW system
    const activePlanRes = await client.query(`
        SELECT ap.id, ap.amount_paid, ap.status, ap.end_date, p.name as plan_name
        FROM active_plans ap
        LEFT JOIN pricing_plans p ON ap.plan_id = p.id
        WHERE ap.vendor_id = $1 AND ap.status = 'ACTIVE'
    `, [vendorId]);
    
    console.log("New System Plans:", activePlanRes.rows);
    
    await client.end();
}

check().catch(console.error);
