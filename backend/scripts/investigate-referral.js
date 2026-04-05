const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function investigate() {
    await client.connect();
    const result = {};

    // User sss
    const user = (await client.query(`SELECT id, email, full_name, role FROM users WHERE email = 'sss@gmail.com'`)).rows[0];
    result.user = user;
    const userId = user.id;

    // Vendor
    const vendor = (await client.query(`SELECT id, is_verified FROM vendors WHERE user_id = $1`, [userId])).rows[0];
    result.vendor = vendor;
    const vendorId = vendor.id;

    // Affiliate
    const aff = (await client.query(`SELECT * FROM affiliates WHERE user_id = $1`, [userId])).rows[0];
    result.affiliate = aff;
    const affId = aff.id;

    // Referrals made by sss
    const referrals = (await client.query(`
        SELECT r.id, r.status, r.type, r.created_at,
               r.referred_user_id,
               ru.email as referred_email, ru.full_name as referred_name
        FROM affiliate_referrals r
        JOIN users ru ON ru.id = r.referred_user_id
        WHERE r.affiliate_id = $1
        ORDER BY r.created_at DESC
    `, [affId])).rows;
    result.referrals_made = referrals;

    // Active plans for sss (the REFERRER)
    const myPlans = (await client.query(`
        SELECT ap.id, ap.status, ap.is_active, ap.start_date, ap.end_date,
               ap.amount_paid, ap.transaction_id,
               pp.name as plan_name, pp.price, pp.duration, pp.unit
        FROM active_plans ap
        JOIN pricing_plans pp ON pp.id = ap.plan_id
        WHERE ap.vendor_id = $1
        ORDER BY ap.created_at DESC
    `, [vendorId])).rows;
    result.my_active_plans = myPlans;

    // Check each referred user's plans (to see if they paid)
    result.referred_users_details = [];
    for (const ref of referrals) {
        const refVendor = (await client.query(`SELECT id FROM vendors WHERE user_id = $1`, [ref.referred_user_id])).rows[0];
        if (!refVendor) {
            result.referred_users_details.push({ email: ref.referred_email, error: 'No vendor profile' });
            continue;
        }
        const refPlans = (await client.query(`
            SELECT ap.status, ap.amount_paid, ap.transaction_id, ap.start_date, ap.end_date,
                   pp.name, pp.price
            FROM active_plans ap
            JOIN pricing_plans pp ON pp.id = ap.plan_id
            WHERE ap.vendor_id = $1
            ORDER BY ap.created_at DESC
        `, [refVendor.id])).rows;

        const refSubs = (await client.query(`
            SELECT s.status, s.amount, s.start_date, s.end_date, pp.name, pp.price
            FROM subscriptions s
            JOIN pricing_plans pp ON pp.id = s.plan_id
            WHERE s.vendor_id = $1
        `, [refVendor.id])).rows;

        result.referred_users_details.push({
            email: ref.referred_email,
            name: ref.referred_name,
            referral_status: ref.status,
            vendor_id: refVendor.id,
            active_plans: refPlans,
            subscriptions: refSubs
        });
    }

    // All pricing plans
    const pricingPlans = (await client.query(`
        SELECT id, name, price, type, duration, unit, is_active FROM pricing_plans ORDER BY price ASC
    `)).rows;
    result.pricing_plans = pricingPlans;

    // Write result to file
    fs.writeFileSync('scripts/result.json', JSON.stringify(result, null, 2), 'utf8');
    console.log('DONE - result written to scripts/result.json');
    await client.end();
}

investigate().catch(err => {
    console.error('Error:', err.message);
    client.end();
});
