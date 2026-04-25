const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    await client.connect();
    try {
        const res = await client.query(`SELECT stripe_price_id FROM subscription_plans LIMIT 1`);
        console.log('Success selecting stripe_price_id');
        console.log(res.rows);
    } catch (err) {
        console.error('Error selecting stripe_price_id:', err.message);
    }
    await client.end();
}
main();
