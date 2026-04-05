const { Client } = require('pg');
async function m() {
    const c = new Client({
        host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway', ssl: { rejectUnauthorized: false }
    });
    await c.connect();
    const res = await c.query("SELECT * FROM active_plans WHERE vendor_id IN (SELECT id FROM vendors WHERE user_id IN (SELECT id FROM users WHERE email = 'sss@gmail.com'))");
    console.log('Final Active Plans for user sss:', JSON.stringify(res.rows, null, 2));
    await c.end();
}
m();
