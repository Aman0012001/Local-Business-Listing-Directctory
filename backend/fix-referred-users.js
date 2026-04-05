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

        const referrerUserId = '98a1be33-bc83-4cc7-b0f6-3ddc0dcf94eb';
        
        // Find Referrals
        const referralsRes = await client.query(
            `SELECT * FROM "affiliate_referrals" WHERE "affiliate_id" = (SELECT id FROM "affiliates" WHERE "user_id" = $1)`,
            [referrerUserId]
        );
        
        console.log(`Checking ${referralsRes.rows.length} referred users...`);

        // Basic Plan ID
        const basicPlanRes = await client.query(`SELECT id FROM "pricing_plans" WHERE name ILIKE '%basic%' LIMIT 1`);
        const basicPlanId = basicPlanRes.rows[0].id;

        for (const r of referralsRes.rows) {
            const referredUserId = r.referred_user_id;
            console.log(`\nReferred User: ${referredUserId}`);

            const vendorRes = await client.query(`SELECT id FROM "vendors" WHERE "user_id" = $1`, [referredUserId]);
            if (vendorRes.rows.length === 0) {
                console.log(`- Skipping: No vendor record for user ${referredUserId}`);
                continue;
            }
            const vendorId = vendorRes.rows[0].id;

            // Mark as verified
            await client.query(`UPDATE "vendors" SET "is_verified" = true WHERE id = $1`, [vendorId]);
            console.log(`- ✅ Verified vendor ${vendorId}`);

            // Approve listings - table is 'businesses'
            const listRes = await client.query(
                `UPDATE "businesses" SET status = 'approved', is_verified = true, is_featured = true, is_sponsored = true, approved_at = NOW() WHERE vendor_id = $1`,
                [vendorId]
            );
            console.log(`- ✅ Approved ${listRes.rowCount} businesses with premium status.`);

            // Ensure they have a plan
            const activePlanRes = await client.query(
                `SELECT id FROM "active_plans" WHERE vendor_id = $1 AND status = 'active' AND end_date > NOW()`,
                [vendorId]
            );

            if (activePlanRes.rows.length === 0) {
                const now = new Date();
                const end = new Date(now);
                end.setDate(end.getDate() + 30);
                await client.query(
                    `INSERT INTO "active_plans" (vendor_id, plan_id, status, start_date, end_date, amount_paid, transaction_id, created_at, updated_at)
                     VALUES ($1, $2, 'active', $3, $4, 0, 'REFERRAL_SIGNUP_REWARD_FIX', NOW(), NOW())`,
                    [vendorId, basicPlanId, now, end]
                );
                console.log(`- ✅ Activated 30-day Basic Plan for referred user.`);
            } else {
                console.log(`- Already has an active plan.`);
            }
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.end();
    }
}

main();
