const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        const res = await client.query('SELECT COUNT(*) FROM search_logs');
        console.log('Search Logs Count:', res.rows[0].count);
        
        const latest = await client.query('SELECT searched_at FROM search_logs ORDER BY searched_at DESC LIMIT 1');
        console.log('Latest log at:', latest.rows[0]?.searched_at);
        
        const keywords = await client.query('SELECT keyword, COUNT(*) FROM search_logs GROUP BY keyword ORDER BY count DESC LIMIT 5');
        console.log('Top keywords:', keywords.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

main();
