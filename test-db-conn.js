const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
};

console.log('Testing connection with config:', { ...config, password: '****' });

const client = new Client(config);

client.connect()
    .then(() => {
        console.log('Successfully connected to Railway database!');
        return client.query('SELECT NOW()');
    })
    .then(res => {
        console.log('Database time:', res.rows[0]);
        return client.end();
    })
    .catch(err => {
        console.error('Connection error:', err.message);
        process.exit(1);
    });
