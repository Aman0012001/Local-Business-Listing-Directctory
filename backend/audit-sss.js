const { Client } = require('pg');

const DB_CONFIG = {
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
};

async function main() {
    const client = new Client(DB_CONFIG);

    try {
        await client.connect();
        console.log('✅ Connected to DB.\n');

        const userId = '98a1be33-bc83-4cc7-b0f6-3ddc0dcf94eb'; // Derived from earlier check
        console.log(`Checking sss: ID: ${userId}`);

        // Find Vendor
        const vendorRes = await client.query(`SELECT id FROM "vendors" WHERE "user_id" = $1`, [userId]);
        const vendorId = vendorRes.rows[0].id;
        console.log(`Vendor ID: ${vendorId}`);

        // Find Affiliate
        const affiliateRes = await client.query(`SELECT id FROM "affiliates" WHERE "user_id" = $1`, [userId]);
        const affiliateId = affiliateRes.rows[0].id;

        // Check Referrals
        const referralsRes = await client.query(`SELECT * FROM "affiliate_referrals" WHERE "affiliate_id" = $1`, [affiliateId]);
        console.log(`\nReferrals Count: ${referralsRes.rows.length}`);
        referralsRes.rows.forEach(r => {
            console.log(`- Ref ID: ${r.id}, User: ${r.referred_user_id}, Status: ${r.status}`);
        });

        // Check Active Plans history
        const plansRes = await client.query(
            `SELECT ap.*, pp.name as plan_name 
             FROM "active_plans" ap 
             LEFT JOIN "pricing_plans" pp ON pp.id = ap.plan_id
             WHERE ap.vendor_id = $1 
             ORDER BY ap.created_at ASC`,
            [vendorId]
        );
        console.log(`\nActive Plans History: ${plansRes.rows.length}`);
        plansRes.rows.forEach(p => {
            console.log(`- [${p.id}] Plan: ${p.plan_name}, status: ${p.status}, trans: ${p.transaction_id}, start: ${p.start_date}, end: ${p.end_date}`);
        });

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.end();
    }
}

main();
