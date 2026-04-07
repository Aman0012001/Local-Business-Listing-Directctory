const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    await client.connect();
    console.log('Final Diagnostic for user "sss"...');
    
    try {
        const userRes = await client.query('SELECT id, email FROM users WHERE email ILIKE $1 LIMIT 1', ['sss@gmail.com']);
        const user = userRes.rows[0];
        if (!user) return console.log('User not found.');

        console.log('User:', user.email, 'ID:', user.id);

        const affRes = await client.query('SELECT id FROM affiliates WHERE user_id = $1', [user.id]);
        const affiliateId = affRes.rows[0]?.id;
        
        if (affiliateId) {
            const refRes = await client.query(`
                SELECT r.id, r.status, u.email as referred_email 
                FROM affiliate_referrals r 
                JOIN users u ON r.referred_user_id = u.id 
                WHERE r.affiliate_id = $1
            `, [affiliateId]);
            console.log('Total Referrals:', refRes.rows.length);
            refRes.rows.forEach(r => console.log(`- ${r.referred_email} (${r.status})`));
        }

        const activeRes = await client.query(`
            SELECT ap.* FROM active_plans ap 
            JOIN vendors v ON ap.vendor_id = v.id 
            WHERE v.user_id = $1
        `, [user.id]);
        console.log('Active Plan:', activeRes.rows[0] ? {
            name: activeRes.rows[0].name,
            expires: activeRes.rows[0].expires_at
        } : 'None');

        const subsRes = await client.query(`
            SELECT s.*, p.name as plan_name 
            FROM subscriptions s 
            JOIN subscription_plans p ON s.plan_id = p.id 
            WHERE s.vendor_id IN (SELECT id FROM vendors WHERE user_id = $1)
        `, [user.id]);
        console.log('Subscriptions found:', subsRes.rows.map(s => ({
            id: s.id,
            plan: s.plan_name,
            status: s.status,
            end: s.end_date
        })));

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
main();
