const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: 'postgres://postgres:RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI@66.33.22.240:45505/railway',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Add total_withdrawals to affiliates
        console.log('Adding total_withdrawals column to affiliates...');
        await client.query(`ALTER TABLE "affiliates" ADD COLUMN IF NOT EXISTS "total_withdrawals" decimal(10,2) DEFAULT 0;`);
        console.log('Done.');

        // 2. Create payouts table
        console.log('Creating payouts table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "payouts" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "affiliate_id" uuid NOT NULL,
                "amount" decimal(10,2) NOT NULL,
                "payment_method" varchar(50) NOT NULL,
                "payment_details" text NOT NULL,
                "status" varchar DEFAULT 'pending',
                "admin_notes" text,
                "processed_at" timestamp,
                "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
                "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Done.');

        console.log("Database schema updated successfully");
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
        console.log('Disconnected from database.');
    }
}
run();
