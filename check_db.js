const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function checkTable() {
    const client = new Client({
        host: '66.33.22.240',
        port: 45505,
        user: 'postgres',
        password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
        database: 'railway',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const tables = ['subscription_plans', 'pricing_plans', 'offer_events', 'offer_event_pricing'];
        for (const table of tables) {
            console.log(`\n--- Checking table: ${table} ---`);
            const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}';`);
            console.log('Columns:', res.rows.map(r => `${r.column_name} (${r.data_type})`));
        }
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        await client.end();
    }
}

checkTable();
