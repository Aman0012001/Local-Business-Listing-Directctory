const { Client } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');

const client = new Client({
    host: process.env.DB_HOST || '66.33.22.240',
    port: parseInt(process.env.DB_PORT || '45505', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: process.env.DB_DATABASE || 'railway',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    
    // reset admin@naampata.com or any first user
    const res = await client.query('SELECT id, email, role FROM "users" WHERE email = $1', ['admin@naampata.com']);
    
    let targetEmail = 'admin@naampata.com';
    let user = res.rows[0];
    
    if (!user) {
        const all = await client.query('SELECT id, email, role FROM "users" LIMIT 5');
        user = all.rows[0];
        targetEmail = user.email;
    }
    
    const newHash = await bcrypt.hash('Admin@123', 10);
    await client.query('UPDATE "users" SET password = $1 WHERE id = $2', [newHash, user.id]);
    
    fs.writeFileSync('users_passwords.txt', `Password for ${targetEmail} (role: ${user.role}) has been reset to Admin@123\n`);
    await client.end();
}

run().catch(console.error);
