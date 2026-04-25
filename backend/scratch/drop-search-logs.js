const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function dropSearchLogs() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        await client.query(`DROP TABLE IF EXISTS search_logs;`);
        console.log('Successfully dropped search_logs table.');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

dropSearchLogs();
