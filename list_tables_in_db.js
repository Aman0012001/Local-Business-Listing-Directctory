const { Client } = require('pg');

const client = new Client({
    host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    await client.connect();
    const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
    `);
    console.log('Tables in public schema:');
    console.log(res.rows.map(r => r.table_name).sort().join(', '));
    await client.end();
}
main();
