const { Client } = require('pg');

const config = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres', // Trying default
    database: 'local_business_platform', // From docker-compose.yml
    ssl: false,
};

console.log('Testing local connection...');

const client = new Client(config);

client.connect()
    .then(() => {
        console.log('SUCCESS: Connected to local DB!');
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
