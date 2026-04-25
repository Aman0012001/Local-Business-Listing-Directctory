const { Client } = require('pg');

async function run() {
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
        console.log('Connected to DB');
        await client.query('ALTER TABLE search_logs ADD COLUMN results_count INTEGER DEFAULT 0;');
        console.log('Column results_count added successfully.');
    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        await client.end();
    }
}

run();
