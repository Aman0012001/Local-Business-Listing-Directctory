const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function checkDetailedPlans() {
    try {
        await client.connect();
        
        console.log('--- subscription_plans ---');
        const resSub = await client.query(`SELECT id, name, price, is_active, plan_type FROM subscription_plans;`);
        resSub.rows.forEach(row => console.log(JSON.stringify(row)));

        console.log('\n--- offer_event_pricing ---');
        // Check if table exists and what columns it has
        const resCols = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'offer_event_pricing';
        `);
        console.log('Columns in offer_event_pricing:', resCols.rows.map(r => r.column_name).join(', '));

        if (resCols.rows.length > 0) {
            const queryCols = resCols.rows.map(r => r.column_name).filter(c => ['id', 'name', 'price', 'is_active', 'type'].includes(c));
            const resOffer = await client.query(`SELECT ${queryCols.join(', ')} FROM offer_event_pricing;`);
            resOffer.rows.forEach(row => console.log(JSON.stringify(row)));
        } else {
            console.log('Table offer_event_pricing does not exist!');
        }

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
    }
}

checkDetailedPlans();
