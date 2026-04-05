const { Client } = require('pg');
async function m() {
    const c = new Client({
        host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway', ssl: { rejectUnauthorized: false }
    });
    await c.connect();
    const res = await c.query("SELECT * FROM active_plans LIMIT 1");
    console.log('Columns in active_plans:', Object.keys(res.rows[0] || {}).join(', '));
    const res2 = await c.query("SELECT * FROM vendors LIMIT 1");
    console.log('Columns in vendors:', Object.keys(res2.rows[0] || {}).join(', '));
    await c.end();
}
m();
