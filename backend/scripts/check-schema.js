const { Client } = require('pg');

async function checkSchema() {
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
        console.log('Connected to database successfully.');

        // Check if notifications table exists
        const tableRes = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE  table_schema = 'public'
                AND    table_name   = 'notifications'
            );
        `);
        console.log('Notifications table exists:', tableRes.rows[0].exists);

        if (tableRes.rows[0].exists) {
            const columnsRes = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'notifications';
            `);
            console.log('Notifications columns:', columnsRes.rows);
        }

        // Check users table columns for is_online, last_active_at
        const userColumnsRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            AND column_name IN ('is_online', 'last_active_at');
        `);
        console.log('Users table status columns:', userColumnsRes.rows);

    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
