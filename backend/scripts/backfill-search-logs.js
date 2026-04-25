const { Client } = require('pg');

async function run() {
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
        console.log('Connected to DB');
        
        // Fetch all IDs of search logs where ip_address is null
        const res = await client.query('SELECT id FROM search_logs WHERE ip_address IS NULL');
        console.log(`Found ${res.rows.length} logs to backfill.`);

        for (const row of res.rows) {
            // Generate a random IP-like string for mocking unique users
            const mockIp = `192.168.1.${Math.floor(Math.random() * 50)}`; 
            await client.query('UPDATE search_logs SET ip_address = $1 WHERE id = $2', [mockIp, row.id]);
        }

        console.log('Backfill completed successfully.');
    } catch (err) {
        console.error('Error during backfill:', err);
    } finally {
        await client.end();
    }
}

run();
