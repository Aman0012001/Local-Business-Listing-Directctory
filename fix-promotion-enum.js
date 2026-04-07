const { Client } = require('pg');

async function fixEnum() {
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
        console.log('Connected to database to fix "promotion_placement_enum"...');

        const enumName = 'promotion_placement_enum';
        const values = ['offer', 'event', 'page'];
        
        for (const val of values) {
            try {
                // In PG, ALTER TYPE ADD VALUE IF NOT EXISTS 
                await client.query(`ALTER TYPE "${enumName}" ADD VALUE IF NOT EXISTS '${val}'`);
                console.log(`Added value '${val}' to ${enumName}`);
            } catch (e) {
                console.warn(`Could not add '${val}' to ${enumName}: ${e.message}`);
            }
        }

        console.log('ENUM update complete.');
    } catch (err) {
        console.error('Error during ENUM fix:', err);
    } finally {
        await client.end();
    }
}

fixEnum();
