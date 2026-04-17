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
        
        // Emulate getInsights('') grouping
        const query = `
            SELECT LOWER(normalized_keyword) as "normalizedKeyword", MAX(keyword) as keyword, COUNT(*) as count 
            FROM search_logs 
            WHERE searched_at >= NOW() - INTERVAL '7 days'
            GROUP BY LOWER(normalized_keyword)
            ORDER BY count DESC
        `;
        const res = await client.query(query);
        console.log('Global Insights (7 days):', res.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

main();
