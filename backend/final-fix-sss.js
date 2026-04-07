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

        const userId = '98a1be33-bc83-4cc7-b0f6-3ddc0dcf94eb';
        const vendorRes = await client.query(`SELECT id FROM "vendors" WHERE "user_id" = $1`, [userId]);
        const vendorId = vendorRes.rows[0].id;
        
        console.log(`Vendor: ${vendorId}`);

        // 1. Ensure referrals are converted
        const referralsRes = await client.query(
            `SELECT id, referred_user_id, status FROM "affiliate_referrals" WHERE "affiliate_id" = (SELECT id FROM "affiliates" WHERE "user_id" = $1)`,
            [userId]
        );
        
        console.log(`Referrals total: ${referralsRes.rows.length}`);
        for (const r of referralsRes.rows) {
            if (r.status !== 'converted') {
                await client.query(`UPDATE "affiliate_referrals" SET "status" = 'converted' WHERE id = $1`, [r.id]);
                console.log(`✅ Converted referral ${r.id}`);
            }
        }

        // 2. Check for rewards already given
        const currentActivePlanRes = await client.query(
            `SELECT * FROM "active_plans" WHERE vendor_id = $1 AND status = 'active' ORDER BY end_date DESC LIMIT 1`,
            [vendorId]
        );
        
        if (currentActivePlanRes.rows.length === 0) {
            console.log("No active plan. Creating one.");
            // Get Basic Plan ID
            const basicPlanRes = await client.query(`SELECT id FROM "pricing_plans" WHERE name ILIKE '%basic%' LIMIT 1`);
            const planId = basicPlanRes.rows[0].id;
            const now = new Date();
            const end = new Date(now);
            end.setDate(end.getDate() + 30);
            await client.query(
                `INSERT INTO "active_plans" (vendor_id, plan_id, status, start_date, end_date, amount_paid, transaction_id, created_at, updated_at)
                 VALUES ($1, $2, 'active', $3, $4, 0, 'ADMIN_MANUAL_REFERRAL_FIX', NOW(), NOW())`,
                [vendorId, planId, now, end]
            );
            console.log("✅ Created Basic Plan for sss.");
        } else {
            const plan = currentActivePlanRes.rows[0];
            console.log(`Current plan ends: ${plan.end_date}. Extending by 30 days.`);
            
            const currentEnd = new Date(plan.end_date);
            currentEnd.setDate(currentEnd.getDate() + 30);
            
            await client.query(
                `UPDATE "active_plans" SET end_date = $1, transaction_id = 'REFERRAL_EXTENSION_FIX', updated_at = NOW() WHERE id = $2`,
                [currentEnd, plan.id]
            );
            console.log(`✅ Extended plan ${plan.id} to ${currentEnd.toISOString()}`);
        }

        await client.query(`UPDATE "vendors" SET "is_verified" = true WHERE id = $1`, [vendorId]);
        console.log("✅ Vendor verified.");

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.end();
    }
}

main();
