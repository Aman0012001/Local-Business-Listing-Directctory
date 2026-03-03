const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function fixVendorProfile() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    try {
        await client.connect();
        console.log('Database connected');

        const email = 'amansalon@gmail.com';
        // Get user id and phone
        const userRes = await client.query('SELECT id, full_name, phone FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            console.log('User not found:', email);
            return;
        }
        const { id: userId, full_name: fullName, phone } = userRes.rows[0];

        // Check if vendor profile exists
        const vendorRes = await client.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
        if (vendorRes.rows.length > 0) {
            console.log('Vendor profile already exists for:', email);
        } else {
            console.log('Creating vendor profile for:', email);
            const businessName = fullName || 'Aman Salon';
            const businessPhone = phone || '+1234567890'; // Placeholder if missing
            const insertRes = await client.query(
                'INSERT INTO vendors (user_id, business_name, business_phone, is_verified) VALUES ($1, $2, $3, $4) RETURNING id',
                [userId, businessName, businessPhone, false]
            );
            console.log('Vendor profile created with ID:', insertRes.rows[0].id);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

fixVendorProfile();
