
const { Client } = require('pg');

async function check() {
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
        
        // Simulating the query in SearchAnalyticsService.getOverview
        const totalRes = await client.query('SELECT COUNT(*) as count FROM search_logs');
        const uniqueRes = await client.query('SELECT COUNT(DISTINCT COALESCE(user_id::text, ip_address)) as count FROM search_logs');
        
        console.log('Total Searches:', totalRes.rows[0].count);
        console.log('Unique Users:', uniqueRes.rows[0].count);
        
        const avg = uniqueRes.rows[0].count > 0 ? (totalRes.rows[0].count / uniqueRes.rows[0].count).toFixed(2) : 0;
        console.log('Avg Searches/User:', avg);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

check();
