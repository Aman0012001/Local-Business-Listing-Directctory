const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function checkUsers() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const emails = ['admin@example.com', 'joy-cafe@example.com', 'customer@example.com', 'premium-vendor@example.com'];

        console.log('--- User Role Verification ---');
        for (const email of emails) {
            const res = await client.query('SELECT email, role, is_active FROM users WHERE email = $1', [email]);
            if (res.rows.length > 0) {
                const user = res.rows[0];
                console.log(`User: ${user.email} | Role: ${user.role} | Active: ${user.is_active}`);
            } else {
                console.log(`User: ${email} | NOT FOUND`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUsers();
