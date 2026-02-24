const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const categories = [
    { name: 'Restaurants & Cafes', slug: 'restaurants-cafes', description: 'Biryani, Desi Cuisine, Fast Food, and Chai places', icon: 'utensils' },
    { name: 'Shopping & Retail', slug: 'shopping-retail', description: 'Clothing, Lawn Suits, Mobile Shops, and Bazaars', icon: 'shopping-bag' },
    { name: 'Beauty & Salons', slug: 'beauty-salons', description: 'Ladies Parlors, Gents Salons, and Bridal Makeup', icon: 'sparkles' },
    { name: 'Healthcare', slug: 'healthcare', description: 'Clinics, Pharmacies, and Diagnostic Labs', icon: 'heart-pulse' },
    { name: 'Education', slug: 'education', description: 'Schools, Coaching Centers, and Universities', icon: 'graduation-cap' },
    { name: 'Real Estate', slug: 'real-estate', description: 'Property Agents, DHA/Bahria Specialists', icon: 'home' },
    { name: 'Automotive', slug: 'automotive', description: 'Car Repair, Spare Parts, and Showrooms', icon: 'car' },
    { name: 'Home Services', slug: 'home-services', description: 'Electricians, Plumbers, and AC Repair', icon: 'wrench' },
    { name: 'Electronics', slug: 'electronics', description: 'Mobile, Laptop, and Home Appliances', icon: 'smartphone' },
    { name: 'Travel & Tours', slug: 'travel-tours', description: 'Visa Services and Tour Operators', icon: 'plane' }
];

async function seedCategories() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
    });

    try {
        await client.connect();
        console.log('Connected to database successfully.');

        for (const cat of categories) {
            // Check if category already exists
            const checkRes = await client.query('SELECT id FROM categories WHERE slug = $1', [cat.slug]);

            if (checkRes.rows.length === 0) {
                const id = uuidv4();
                await client.query(
                    'INSERT INTO categories (id, name, slug, description, icon_url, is_active, display_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
                    [id, cat.name, cat.slug, cat.description, cat.icon, true, 0]
                );
                console.log(`Inserted category: ${cat.name}`);
            } else {
                console.log(`Category already exists: ${cat.name}`);
            }
        }

        console.log('Seeding completed successfully!');
    } catch (err) {
        console.error('Error during seeding:', err.message);
    } finally {
        await client.end();
    }
}

seedCategories();
