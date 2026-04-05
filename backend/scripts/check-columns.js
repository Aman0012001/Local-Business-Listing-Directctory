const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    console.log('✅ Connected\n');

    const tables = ['affiliates', 'affiliate_referrals', 'active_plans', 'pricing_plans', 'vendors', 'users', 'subscriptions'];

    for (const table of tables) {
        const cols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = $1
            ORDER BY ordinal_position
        `, [table]);
        console.log(`\n=== ${table} ===`);
        cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
    }

    await client.end();
}

run().catch(err => { console.error('Error:', err.message); client.end(); });
