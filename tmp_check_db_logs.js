const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function check() {
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
        const res = await client.query('SELECT COUNT(*) FROM search_logs');
        console.log('Total search logs:', res.rows[0].count);
        
        const recent = await client.query("SELECT COUNT(*) FROM search_logs WHERE searched_at >= NOW() - INTERVAL '24 hours'");
        console.log('Logs in last 24h:', recent.rows[0].count);

        if (parseInt(res.rows[0].count) > 0) {
            const sample = await client.query('SELECT * FROM search_logs LIMIT 5');
            console.log('Sample logs:', JSON.stringify(sample.rows, null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

check();
