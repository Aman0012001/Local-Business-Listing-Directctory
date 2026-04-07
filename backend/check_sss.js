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
        console.log("Users Found:", userRes.rows);

        if (userRes.rows.length === 0) {
            console.log("No user found.");
            return;
        }

        const userId = userRes.rows[0].id;

        // Check if there's a vendor associated with this user
        const vendorRes = await client.query(`SELECT * FROM "vendors" WHERE "userId" = $1`, [userId]);
        console.log("Vendor Found:", vendorRes.rows);

        const vendorId = vendorRes.rows.length > 0 ? vendorRes.rows[0].id : null;

        // Check affiliates/referrals
        const affiliateRes = await client.query(`SELECT * FROM "affiliates" WHERE "userId" = $1`, [userId]);
        console.log("Affiliate Record:", affiliateRes.rows);
        
        let affiliateId = null;
        if (affiliateRes.rows.length > 0) {
            affiliateId = affiliateRes.rows[0].id;
            
            const referralsRes = await client.query(`SELECT * FROM "affiliate_referrals" WHERE "affiliateId" = $1`, [affiliateId]);
            console.log("Referrals for this user's affiliate ID:", referralsRes.rows);
        }

        if (vendorId) {
             const subRes = await client.query(`SELECT * FROM "active_plans" WHERE "vendorId" = $1`, [vendorId]);
             console.log("Active Plans:", subRes.rows);
             
             // Check if they have a +1 Month Extension plan? Let's check subscription_plans
             const plans = await client.query(`SELECT * FROM "subscription_plans"`);
             console.log("All subscription plans:", plans.rows.map(p => ({ id: p.id, name: p.name, durationDays: p.durationDays })));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
