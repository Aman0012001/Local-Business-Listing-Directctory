const { Client } = require('pg');

const client = new Client({
    host: "66.33.22.240",
    port: 45505,
    user: "postgres",
    password: "RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI",
    database: "railway",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    
    const countRes = await client.query('SELECT COUNT(*) FROM search_logs');
    console.log("Total search_logs:", countRes.rows[0].count);
    
    if (countRes.rows[0].count > 0) {
        const heatmapRes = await client.query('SELECT COUNT(*) FROM search_logs WHERE latitude IS NOT NULL AND longitude IS NOT NULL');
        console.log("With lat/lng:", heatmapRes.rows[0].count);
        
        const latestRes = await client.query('SELECT searched_at, latitude, longitude, city FROM search_logs ORDER BY searched_at DESC LIMIT 5');
        console.log("Latest 5 records:", JSON.stringify(latestRes.rows, null, 2));
    }

    await client.end();
}

run().catch(console.error);
