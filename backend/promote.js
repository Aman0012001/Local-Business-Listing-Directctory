const { Client } = require('pg');
const c = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
});

c.connect()
    .then(() => c.query("UPDATE users SET role = 'superadmin' WHERE email = 'krishnarajputkiaan@gmail.com' OR email = 'renurajput6260@gmail.com'"))
    .then(r => console.log('Updated:', r.rowCount))
    .catch(console.error)
    .finally(() => c.end());
