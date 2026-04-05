const { Client } = require('pg');

const client = new Client({
    host:  '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    await client.connect();
    const tables = ['referrals', 'affiliate_stats'];
    for (const table of tables) {
        const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}';`);
        console.log(`Columns in ${table}:`, res.rows.map(r => r.column_name).sort().join(', '));
    }
    await client.end();
}
main();
