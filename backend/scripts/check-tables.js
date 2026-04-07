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

    // List all tables
    const tables = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    `);
    console.log('=== ALL TABLES ===');
    tables.rows.forEach(r => console.log(' -', r.table_name));

    await client.end();
}

run().catch(err => { console.error('Error:', err.message); client.end(); });
