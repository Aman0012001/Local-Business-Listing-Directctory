const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function checkPlans() {
    try {
        await client.connect();
        
        console.log('--- Checking subscription_plans ---');
        try {
            const resSub = await client.query(`SELECT id, name, price, is_active, plan_type FROM subscription_plans;`);
            console.log(JSON.stringify(resSub.rows, null, 2));
        } catch (e) {
            console.error('Error fetching subscription_plans:', e.message);
        }

        console.log('\n--- Checking offer_event_pricing ---');
        try {
            const resOffer = await client.query(`SELECT id, name, price, is_active FROM offer_event_pricing;`);
            console.log(JSON.stringify(resOffer.rows, null, 2));
        } catch (e) {
            console.error('Error fetching offer_event_pricing:', e.message);
        }

    } catch (err) {
        console.error('Database connection error:', err.stack);
    } finally {
        await client.end();
    }
}

checkPlans();
