const { Client } = require('pg');

async function findSampleUser() {
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
        const res = await client.query('SELECT id, email, full_name, role FROM users LIMIT 10');
        console.log('Sample Users (from Railway DB):');
        console.table(res.rows);
    } catch (err) {
        console.error('Database connection failed:', err.message);
    } finally {
        await client.end();
    }
}

findSampleUser();
