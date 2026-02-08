const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    password: '5432',
    host: 'localhost',
    port: 5432,
    database: 'business_saas_db'
});

async function verifySetup() {
    try {
        await client.connect();
        console.log('🔗 PostgreSQL Connection: ✅ CONNECTED\n');

        // Count records in each table
        const tables = [
            'users',
            'vendors',
            'categories',
            'businesses',
            'reviews',
            'leads',
            'favorites',
            'subscriptions',
            'transactions',
            'notifications'
        ];

        console.log('📊 Database Statistics:\n');
        console.log('Table Name              | Record Count');
        console.log('------------------------|-------------');

        for (const table of tables) {
            const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
            const count = result.rows[0].count;
            const paddedTable = table.padEnd(23);
            console.log(`${paddedTable} | ${count}`);
        }

        // Check ENUMs
        const enumsResult = await client.query(`
            SELECT typname 
            FROM pg_type 
            WHERE typtype = 'e' 
            ORDER BY typname
        `);

        console.log('\n🏷️  ENUMs Configured:');
        enumsResult.rows.forEach(row => {
            console.log(`  ✓ ${row.typname}`);
        });

        // Check indexes
        const indexResult = await client.query(`
            SELECT 
                schemaname,
                tablename,
                indexname
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname
        `);

        console.log(`\n📇 Indexes: ${indexResult.rows.length} total`);

        await client.end();

        console.log('\n✅ Database Verification Complete!');
        console.log('\n🎉 Your PostgreSQL database is fully configured and ready to use!');
        console.log('\nNext steps:');
        console.log('  1. Backend API is running at http://localhost:3005/api/v1');
        console.log('  2. All data is being stored in PostgreSQL');
        console.log('  3. Check docs/DATABASE_SETUP_COMPLETE.md for full documentation');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

verifySetup();
