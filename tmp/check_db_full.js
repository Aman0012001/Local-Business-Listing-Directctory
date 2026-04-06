const { Client } = require('pg');
async function checkDatabase() {
    const c = new Client({
        host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway', ssl: { rejectUnauthorized: false }
    });
    try {
        await c.connect();
        console.log('Connected to database.');

        // 1. Check Pricing Plans
        const plansRes = await c.query("SELECT * FROM pricing_plans WHERE name ILIKE 'Free'");
        console.log('\n--- PRICING PLANS (Free) ---');
        console.log(JSON.stringify(plansRes.rows, null, 2));

        // 2. Check Active Plans for Vendors (sample check)
        const activeRes = await c.query(`
            SELECT ap.*, pp.name as plan_name 
            FROM active_plans ap
            LEFT JOIN pricing_plans pp ON ap.pricing_plan_id = pp.id
            ORDER BY ap.created_at DESC
            LIMIT 5
        `);
        console.log('\n--- RECENT ACTIVE PLANS ---');
        console.log(JSON.stringify(activeRes.rows, null, 2));

        // 3. Check Subscriptions table (if it exists)
        try {
            const subRes = await c.query("SELECT * FROM subscriptions LIMIT 1");
             console.log('\n--- SUBSCRIPTIONS TABLE EXISTS ---');
        } catch (e) {
            console.log('\n--- SUBSCRIPTIONS TABLE NOT FOUND ---');
        }

    } catch (err) {
        console.error('Database Error:', err.message);
    } finally {
        await c.end();
    }
}
checkDatabase();
