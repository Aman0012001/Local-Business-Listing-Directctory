const { Client } = require('pg');
async function checkTableInfo() {
    const c = new Client({
        host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway', ssl: { rejectUnauthorized: false }
    });
    try {
        await c.connect();
        
        const res = await c.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'active_plans'
        `);
        console.log('\n--- ACTIVE_PLANS COLUMNS ---');
        console.log(JSON.stringify(res.rows, null, 2));

        const res2 = await c.query("SELECT * FROM active_plans LIMIT 3");
        console.log('\n--- SAMPLE ACTIVE_PLANS DATA ---');
        console.log(JSON.stringify(res2.rows, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await c.end();
    }
}
checkTableInfo();
