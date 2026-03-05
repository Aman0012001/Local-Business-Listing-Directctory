const { Client } = require('pg');

async function updateSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/railway'
    });

    try {
        await client.connect();

        // Add parent_id column if it doesn't exist
        await client.query(`
            ALTER TABLE categories 
            ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;
        `);

        // Add icon column if it doesn't exist
        await client.query(`
            ALTER TABLE categories 
            ADD COLUMN IF NOT EXISTS icon TEXT;
        `);

        console.log('Successfully restored parent_id and icon columns');
    } catch (err) {
        console.error('Error restoring schema:', err);
    } finally {
        await client.end();
    }
}

updateSchema();
