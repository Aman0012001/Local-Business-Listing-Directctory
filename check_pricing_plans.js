const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function checkPricingPlans() {
    try {
        await client.connect();
        
        console.log('--- Checking pricing_plans (subscription) ---');
        const res = await client.query(`SELECT id, name, price, is_active, type FROM pricing_plans WHERE type='subscription';`);
        console.log(JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
    }
}

checkPricingPlans();
