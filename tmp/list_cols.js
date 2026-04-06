const { Client } = require('pg');
async function listColumns() {
    const c = new Client({
        host: '66.33.22.240', port: 45505, user: 'postgres', password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI', database: 'railway', ssl: { rejectUnauthorized: false }
    });
    try {
        await c.connect();
        const res = await c.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'active_plans'
        `);
        console.log('Columns:', res.rows.map(r => r.column_name));
    } finally {
        await c.end();
    }
}
listColumns();
