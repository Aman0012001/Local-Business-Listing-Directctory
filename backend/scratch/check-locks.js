const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function checkLocks() {
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
        
        const res = await client.query(`
            SELECT
                locktype,
                relation::regclass,
                mode,
                granted,
                pid,
                query
            FROM pg_locks
            JOIN pg_stat_activity USING (pid)
            WHERE pid <> pg_backend_pid();
        `);
        console.table(res.rows);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkLocks();
