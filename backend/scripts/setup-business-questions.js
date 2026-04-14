const { Client } = require('pg');
require('dotenv').config();

async function setupBusinessQuestions() {
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
        console.log('Connected to database');

        // Create Business Questions Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS business_questions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                category VARCHAR(255) NOT NULL,
                question TEXT NOT NULL,
                options JSONB NOT NULL,
                is_active BOOLEAN DEFAULT true,
                "order" INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table business_questions verified/created');

        // Create Vendor Attributes Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS vendor_attributes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
                attribute_key VARCHAR(255) NOT NULL,
                attribute_value TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table vendor_attributes verified/created');

        // Check if index exists
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_vendor_attributes_vendor_id ON vendor_attributes(vendor_id);
            CREATE INDEX IF NOT EXISTS idx_vendor_attributes_key ON vendor_attributes(attribute_key);
        `);

        // Seed initial questions if none exist
        const { rows } = await client.query('SELECT count(*) FROM business_questions');
        if (parseInt(rows[0].count) === 0) {
            console.log('Seeding initial questions...');
            
            const questions = [
                {
                    category: 'Service Mode',
                    question: 'How do you provide your services?',
                    options: JSON.stringify(['Home Service', 'In-store / Studio', 'Online / Virtual', 'Emergency Services']),
                    order: 1
                },
                {
                    category: 'Payment Methods',
                    question: 'Which payment methods do you accept?',
                    options: JSON.stringify(['Cash', 'UPI / QR Code', 'Credit/Debit Card', 'Net Banking', 'Digital Wallets']),
                    order: 2
                },
                {
                    category: 'Business Features',
                    question: 'What amenities or features does your business offer?',
                    options: JSON.stringify(['WiFi Available', 'Parking Space', 'Air Conditioned', 'Wheelchair Accessible', 'Waiting Area', 'Contactless Delivery']),
                    order: 3
                }
            ];

            for (const q of questions) {
                await client.query(
                    'INSERT INTO business_questions (category, question, options, "order") VALUES ($1, $2, $3, $4)',
                    [q.category, q.question, q.options, q.order]
                );
            }
            console.log('Questions seeded successfully');
        } else {
            console.log('Questions already exist, skipping seed.');
        }

    } catch (err) {
        console.error('Error during setup:', err);
    } finally {
        await client.end();
    }
}

setupBusinessQuestions();
