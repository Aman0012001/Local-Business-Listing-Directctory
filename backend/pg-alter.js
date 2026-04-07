const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: 'postgres://postgres:RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI@66.33.22.240:45505/railway',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        await client.query(`ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "is_suspicious" boolean NOT NULL DEFAULT false;`);
        console.log('Added is_suspicious');
        
        await client.query(`ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "suspicion_score" real NOT NULL DEFAULT 0;`);
        console.log('Added suspicion_score');
        
        await client.query(`ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "suspicion_reason" text;`);
        console.log('Added suspicion_reason');
        
        await client.query(`ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "ip_address" character varying;`);
        console.log('Added ip_address');
        
        console.log("All columns checked/added successfully");
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
        console.log('Disconnected from database.');
    }
}
run();
