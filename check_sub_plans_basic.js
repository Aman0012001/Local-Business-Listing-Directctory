const { Client } = require('pg');
async function m() {
    const c = new Client({
        host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway', ssl: { rejectUnauthorized: false }
    });
    await c.connect();
    const res = await c.query("SELECT id, name FROM subscription_plans WHERE name ILIKE 'Basic'");
    console.log('Subscription Plans (Basic):', JSON.stringify(res.rows, null, 2));
    await c.end();
}
m();
