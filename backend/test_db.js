const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI@66.33.22.240:45505/railway', ssl: { rejectUnauthorized: false } });
client.connect().then(async () => {
    try {
        const res = await client.query("SELECT dashboard_features FROM subscription_plans WHERE id = '00000000-0000-0000-0000-000000000003'");
        console.log('Features:', res.rows[0].dashboard_features);
    } catch(e) { console.error('Error:', e.message); }
    client.end();
});
