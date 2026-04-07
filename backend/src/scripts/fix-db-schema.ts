import { Client } from 'pg';

async function run() {
    const client = new Client({
        host: '66.33.22.240',
        port: 45505,
        user: 'postgres',
        password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
        database: 'railway',
        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log('🔌 Connecting to database...');
    try {
        await client.connect();
        console.log('✅ Connected.');

        console.log('🛠 Running ALTER TABLE...');
        await client.query(`
            ALTER TABLE promotion_pricing_rules 
            ADD COLUMN IF NOT EXISTS base_price decimal(10,2) DEFAULT 0;
        `);
        console.log('✅ Column base_price added (if it didn\'t exist).');

    } catch (error) {
        console.error('❌ Error fixing schema:', error);
    } finally {
        await client.end();
        process.exit(0);
    }
}

run();
