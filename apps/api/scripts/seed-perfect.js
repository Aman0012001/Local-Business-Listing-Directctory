const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
    user: 'postgres',
    password: '5432',
    host: 'localhost',
    port: 5432,
    database: 'business_saas_db'
});

const CITIES = [
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 }
];

const CATEGORIES = [
    { name: 'Restaurants & Food', slug: 'restaurants-food' },
    { name: 'Health & Wellness', slug: 'health-wellness' },
    { name: 'Education', slug: 'education' },
    { name: 'Home Services', slug: 'home-services' },
    { name: 'Beauty & Spa', slug: 'beauty-spa' },
    { name: 'Automotive', slug: 'automotive' },
    { name: 'Shopping', slug: 'shopping' },
    { name: 'Professional Services', slug: 'professional-services' }
];

async function seed() {
    try {
        await client.connect();
        console.log('🚀 Starting Perfect Seeding (v2)...');

        // 1. Clean data
        console.log('🧹 Cleaning old data...');
        await client.query('TRUNCATE reviews, leads, businesses, vendors, users, categories CASCADE');

        // 2. Seed Categories
        console.log('📂 Seeding categories...');
        const catMap = {};
        for (const cat of CATEGORIES) {
            const id = uuidv4();
            await client.query(
                'INSERT INTO categories (id, name, slug, is_active) VALUES ($1, $2, $3, $4)',
                [id, cat.name, cat.slug, true]
            );
            catMap[cat.slug] = id;
        }

        // 3. Seed Users & Vendors
        console.log('👤 Seeding vendors...');
        const vendorIds = [];
        for (let i = 1; i <= 5; i++) {
            const userId = uuidv4();
            const vendorId = uuidv4();

            // Insert User
            await client.query(
                'INSERT INTO users (id, email, full_name, role, is_active) VALUES ($1, $2, $3, $4, $5)',
                [userId, `vendor${i}@example.com`, `Vendor User ${i}`, 'vendor', true]
            );

            // Insert Vendor
            await client.query(
                'INSERT INTO vendors (id, user_id, business_name, business_phone, is_verified) VALUES ($1, $2, $3, $4, $5)',
                [vendorId, userId, `Listing Partner ${i}`, `999990000${i}`, true]
            );
            vendorIds.push(vendorId);
        }

        // 4. Seed Businesses
        console.log('📍 Seeding 50+ business listings across cities...');
        const businessTypes = {
            'restaurants-food': ['Bistro', 'Cafe', 'Diner', 'Kitchen', 'Grill', 'Sweets'],
            'health-wellness': ['Clinic', 'Hospital', 'Gym', 'Yoga Studio', 'Pharmacy'],
            'education': ['Academy', 'Institute', 'School', 'Tuition Center', 'Coaching'],
            'home-services': ['Electricians', 'Plumbing', 'Cleaning', 'Pest Control', 'Carpentry'],
            'beauty-spa': ['Salon', 'Spa', 'Skin Care', 'Hair Studio', 'Makeup Artist'],
            'automotive': ['Car Service', 'Tyre Shop', 'Detailing', 'Bike Point', 'Spare Parts'],
            'shopping': ['Boutique', 'Mall', 'Grocery store', 'Electronics', 'Footwear'],
            'professional-services': ['Law Firm', 'Audit Associates', 'Consulting Group', 'Tax Planner']
        };

        let count = 0;
        for (const city of CITIES) {
            for (const cat of CATEGORIES) {
                const types = businessTypes[cat.slug];
                const type = types[Math.floor(Math.random() * types.length)];
                const name = `${city.name} ${type} ${Math.floor(Math.random() * 100)}`;
                const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
                const id = uuidv4();
                const vendorId = vendorIds[Math.floor(Math.random() * vendorIds.length)];

                await client.query(
                    `INSERT INTO businesses (
                        id, vendor_id, category_id, name, slug, description, short_description,
                        phone, email, address, city, state, pincode, latitude, longitude,
                        status, is_verified, is_featured, average_rating, total_reviews
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
                    [
                        id, vendorId, catMap[cat.slug], name, slug,
                        `Welcome to ${name}, the premier ${cat.name.toLowerCase()} destination in ${city.name}. We pride ourselves on exceptional quality and local service.`,
                        `Premium ${cat.name} in the heart of ${city.name}.`,
                        `022-${Math.floor(1000000 + Math.random() * 9000000)}`,
                        `contact@${slug}.com`,
                        `${Math.floor(Math.random() * 500)} Main St, Near Mall`,
                        city.name, city.state, '400001',
                        (city.lat + (Math.random() - 0.5) * 0.1).toFixed(8),
                        (city.lng + (Math.random() - 0.5) * 0.1).toFixed(8),
                        'approved', true, Math.random() > 0.7,
                        (3.5 + Math.random() * 1.5).toFixed(2),
                        Math.floor(Math.random() * 200)
                    ]
                );
                count++;
            }
        }

        console.log(`✅ Successfully seeded ${count} businesses!`);
        await client.end();
        console.log('🎉 Seeding complete.');
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
}

seed();
