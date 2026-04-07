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

        // ─── Step 1: Find User 'sss' ─────────────────────────────────────────────
        const userRes = await client.query(
            `SELECT id, full_name, email, role FROM "users" WHERE "full_name" ILIKE '%sss%' OR "email" ILIKE '%sss%' LIMIT 5`
        );
        
        if (userRes.rows.length === 0) {
            console.log('❌ No user found.');
            return;
        }

        for (const user of userRes.rows) {
            console.log(`\n═══════════════════════════════════════════════════════`);
            console.log(`ANALYZING USER: ${user.full_name} (${user.email}) ID: ${user.id}`);
            console.log(`═══════════════════════════════════════════════════════`);

            const userId = user.id;

            // Find Vendor
            const vendorRes = await client.query(`SELECT id FROM "vendors" WHERE "user_id" = $1`, [userId]);
            const vendorId = vendorRes.rows.length > 0 ? vendorRes.rows[0].id : null;
            console.log(`Vendor ID: ${vendorId || 'NONE'}`);

            // Find Affiliate
            const affiliateRes = await client.query(`SELECT id, referral_code FROM "affiliates" WHERE "user_id" = $1`, [userId]);
            if (affiliateRes.rows.length === 0) {
                console.log('User is not an affiliate.');
                continue;
            }
            const affiliateId = affiliateRes.rows[0].id;
            console.log(`Affiliate ID: ${affiliateId}, Code: ${affiliateRes.rows[0].referral_code}`);

            // Find Referrals
            const referralsRes = await client.query(
                `SELECT ar.*, u.full_name as referred_name, u.email as referred_email 
                 FROM "affiliate_referrals" ar
                 LEFT JOIN "users" u ON u.id = ar.referred_user_id
                 WHERE ar.affiliate_id = $1`,
                [affiliateId]
            );
            
            console.log(`Total Referrals: ${referralsRes.rows.length}`);
            referralsRes.rows.forEach(r => {
                console.log(`- ${r.referred_name} (${r.referred_email}): status=${r.status}, type=${r.type}`);
            });

            const converted = referralsRes.rows.filter(r => r.status === 'converted');
            const pending = referralsRes.rows.filter(r => r.status === 'pending');

            // Find Basic Plan
            const basicPlanRes = await client.query(
                `SELECT id, name, duration, unit FROM "pricing_plans" 
                 WHERE type = 'subscription' AND is_active = true AND name ILIKE '%basic%' LIMIT 1`
            );
            const basicPlan = basicPlanRes.rows[0];

            // Check Active Plans
            const activePlansRes = await client.query(
                `SELECT ap.*, pp.name as plan_name 
                 FROM "active_plans" ap
                 LEFT JOIN "pricing_plans" pp ON pp.id = ap.plan_id
                 WHERE ap.vendor_id = $1 AND ap.status = 'active' AND ap.end_date > NOW()`,
                [vendorId]
            );
            console.log(`Current Active Plans: ${activePlansRes.rows.length}`);
            activePlansRes.rows.forEach(p => console.log(`- Active: ${p.plan_name} (Ends: ${p.end_date})`));

            // CRITERIA: If user has 2 referrals (even if pending, as per user's "have 2 active referral" context) 
            // OR if they are converted and no plan is active.
            
            if (referralsRes.rows.length >= 2) {
                console.log(`\n👉 User has ${referralsRes.rows.length} total referrals. Let's ensure at least 2 are converted.`);
                
                if (converted.length < 2 && (converted.length + pending.length) >= 2) {
                    console.log(`Converting ${2 - converted.length} pending referrals to reach the threshold...`);
                    const toConvert = pending.slice(0, 2 - converted.length);
                    for (const r of toConvert) {
                        await client.query(`UPDATE "affiliate_referrals" SET "status" = 'converted' WHERE "id" = $1`, [r.id]);
                        console.log(`✅ Converted referral ${r.id} (${r.referred_name})`);
                    }
                }

                // Re-check converted count
                const finalConverted = await client.query(`SELECT count(*) FROM "affiliate_referrals" WHERE "affiliate_id" = $1 AND "status" = 'converted'`, [affiliateId]);
                const convertedCount = parseInt(finalConverted.rows[0].count);

                if (convertedCount >= 2) {
                    console.log(`\n✅ User now has ${convertedCount} converted referrals.`);
                    
                    if (activePlansRes.rows.length === 0) {
                        console.log(`Applying Basic Plan since no active subscription found...`);
                        if (vendorId && basicPlan) {
                            await applyBasicPlan(client, vendorId, basicPlan);
                        } else {
                            console.log(`❌ Missing Vendor ID or Basic Plan.`);
                        }
                    } else {
                        console.log(`User already has an active plan.`);
                    }
                }
            } else {
                console.log(`User only has ${referralsRes.rows.length} referrals. Minimum 2 needed.`);
            }
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.end();
    }
}

async function applyBasicPlan(client, vendorId, basicPlan) {
    const now = new Date();
    let durationDays = 30; // Default
    if (basicPlan.unit === 'months') durationDays = (basicPlan.duration || 1) * 30;
    
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + durationDays);

    console.log(`🔧 Activating ${basicPlan.name} for 30 days...`);
    
    await client.query(
        `INSERT INTO "active_plans" ("vendor_id", "plan_id", "status", "start_date", "end_date", "amount_paid", "transaction_id", "created_at", "updated_at")
         VALUES ($1, $2, 'active', $3, $4, 0, 'REFERRAL_REWARD_2_CONVERSIONS', NOW(), NOW())`,
        [vendorId, basicPlan.id, now, endDate]
    );

    await client.query(`UPDATE "vendors" SET "is_verified" = true WHERE "id" = $1`, [vendorId]);
    console.log(`✅ Success!`);
}

main();
