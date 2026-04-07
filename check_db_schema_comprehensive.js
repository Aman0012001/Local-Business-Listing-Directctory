const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkSchema() {
    const client = new Client({
        host: process.env.DB_HOST || '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const tables = ['vendors', 'active_plans', 'subscriptions', 'subscription_plans'];
        for (const table of tables) {
            const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}';`);
            console.log(`Columns in ${table}:`, res.rows.map(r => r.column_name).sort().join(', '));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
checkSchema();
