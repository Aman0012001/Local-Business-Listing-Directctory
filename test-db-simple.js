const { Client } = require('pg');

const config = {
    host: 'shuttle.proxy.rlwy.net',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 60000, // 60 seconds
};

console.log('Testing connection with 60s timeout...');

const client = new Client(config);

client.connect()
    .then(() => {
        console.log('SUCCESS: Connected to Railway!');
        return client.query('SELECT 1 as result');
    })
    .then(res => {
        console.log('QUERY OK:', res.rows[0]);
        return client.end();
    })
    .catch(err => {
        console.error('ERROR:', err.message);
        process.exit(1);
    });
