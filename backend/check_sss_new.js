const { Client } = require('pg');

async function main() {
    const client = new Client({
        host: '66.33.22.240',
        port: 45505,
        user: 'postgres',
        password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
        database: 'railway',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        console.log("Connected to DB.");

        // First find user 'sss'
        const userRes = await client.query(`SELECT * FROM "users" WHERE "full_name" ILIKE '%sss%' OR "email" ILIKE '%sss%' LIMIT 1`);
        
        if (userRes.rows.length === 0) {
            console.log("No user found.");
            return;
        }

        const userId = userRes.rows[0].id;
        console.log("User ID:", userId);

        const tables = ["vendors", "affiliates", "affiliate_referrals", "active_plans"];
        for(let table of tables) {
            const cols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [table]);
            console.log(`Columns for ${table}:`, cols.rows.map(r => r.column_name).join(', '));
        }

        const vendorRes = await client.query(`SELECT * FROM "vendors" WHERE "user_id" = $1`, [userId]);
        console.log("Vendor Found:", vendorRes.rows);

        const vendorId = vendorRes.rows.length > 0 ? vendorRes.rows[0].id : null;

        const affiliateRes = await client.query(`SELECT * FROM "affiliates" WHERE "user_id" = $1`, [userId]);
        console.log("Affiliate:", affiliateRes.rows);

        if (affiliateRes.rows.length > 0) {
            const affiliateId = affiliateRes.rows[0].id;
            const referralsRes = await client.query(`SELECT * FROM "affiliate_referrals" WHERE "affiliate_id" = $1`, [affiliateId]);
            console.log("Referrals for this user's affiliate ID:", referralsRes.rows);
        }

        if (vendorId) {
             const subRes = await client.query(`SELECT * FROM "active_plans" WHERE "vendor_id" = $1`, [vendorId]);
             console.log("Active Plans:", subRes.rows);
             
             const plans = await client.query(`SELECT * FROM "subscription_plans"`);
             console.log("All subscription plans:", plans.rows.map(p => ({ id: p.id, name: p.name, durationDays: p.durationDays })));
             
             const subs = await client.query(`SELECT * FROM "subscriptions" WHERE "vendor_id" = $1`, [vendorId]);
             console.log("Subscriptions:", subs.rows);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
