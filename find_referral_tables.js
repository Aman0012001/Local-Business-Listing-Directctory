const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    await client.connect();
    const res = await client.query(`
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_name ILIKE '%referral%' OR table_name ILIKE '%affiliate%';
    `);
    console.log('Columns matching referral/affiliate:');
    res.rows.forEach(r => {
        console.log(`${r.table_name}: ${r.column_name}`);
    });
    await client.end();
}
main();
