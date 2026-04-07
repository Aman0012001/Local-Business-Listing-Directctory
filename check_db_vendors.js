const { Client } = require('pg');

async function checkVendors() {
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
        const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vendors';`);
        console.log('Vendors Columns:', res.rows.map(r => `${r.column_name} (${r.data_type})`));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkVendors();
