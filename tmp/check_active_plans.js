const { Client } = require('pg');
async function checkActivePlans() {
    const c = new Client({
        host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway', ssl: { rejectUnauthorized: false }
    });
    try {
        await c.connect();
        
        const res = await c.query(`
            SELECT ap.id, ap.plan_id, pp.name as plan_name, ap.vendor_id, ap.status, ap.end_date 
            FROM active_plans ap
            LEFT JOIN pricing_plans pp ON ap.plan_id = pp.id
            ORDER BY ap.created_at DESC
            LIMIT 10
        `);
        console.log('\n--- ACTIVE PLANS ---');
        console.log(JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await c.end();
    }
}
checkActivePlans();
