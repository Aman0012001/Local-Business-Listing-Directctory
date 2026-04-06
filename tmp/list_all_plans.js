const { Client } = require('pg');
async function listAllPlans() {
    const c = new Client({
        host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway', ssl: { rejectUnauthorized: false }
    });
    try {
        await c.connect();
        const res = await c.query("SELECT name, features FROM pricing_plans");
        console.log('Plans:', JSON.stringify(res.rows, null, 2));
    } finally {
        await c.end();
    }
}
listAllPlans();
