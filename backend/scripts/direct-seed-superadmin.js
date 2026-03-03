
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
    host: '66.33.22.240',
    port: 45505,
    user: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database');
        const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

        // Check if user exists
        const res = await client.query('SELECT id FROM users WHERE email = $1', ['superadmin@example.com']);

        if (res.rows.length > 0) {
            console.log('User exists, promoting to superadmin');
            await client.query('UPDATE users SET role = $1 WHERE email = $2', ['superadmin', 'superadmin@example.com']);
        } else {
            console.log('Creating new superadmin');
            const query = `
        INSERT INTO users (email, password, full_name, role, is_active, is_email_verified)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
            await client.query(query, ['superadmin@example.com', hashedPassword, 'Super Admin', 'superadmin', true, true]);
        }

        console.log('Success!');
        console.log('Credentials:');
        console.log('Email: superadmin@example.com');
        console.log('Password: SuperAdmin123!');
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
    }
}

run();
