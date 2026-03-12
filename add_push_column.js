const { Client } = require('pg');
const client = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS push_subscriptions jsonb NOT NULL DEFAULT '[]'`))
    .then(r => { console.log('Migration OK:', r.command); client.end(); })
    .catch(e => { console.error('Migration error:', e.message); client.end(); });
