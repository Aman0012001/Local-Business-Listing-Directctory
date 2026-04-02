const { Client } = require('pg');

async function findEnum() {
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
        console.log('Searching for promotion enum...');

        const query = `
            SELECT 
                t.typname as enum_name,
                e.enumlabel as value
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE t.typtype = 'e'
            ORDER BY enum_name, e.enumsortorder;
        `;

        const res = await client.query(query);
        const enums = {};
        res.rows.forEach(row => {
            if (!enums[row.enum_name]) enums[row.enum_name] = [];
            enums[row.enum_name].push(row.value);
        });

        for (const [name, values] of Object.entries(enums)) {
            if (values.includes('homepage')) {
                console.log(`Found matching enum: "${name}" with values: [${values.join(', ')}]`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

findEnum();
