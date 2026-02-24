const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const cities = [
    { name: 'Karachi', slug: 'karachi', isPopular: true, image: 'https://images.unsplash.com/photo-1565551918361-9c60655ce24c?auto=format&fit=crop&q=80&w=800' },
    { name: 'Lahore', slug: 'lahore', isPopular: true, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=800' },
    { name: 'Islamabad', slug: 'islamabad', isPopular: true, image: 'https://images.unsplash.com/photo-1627588145244-6447881023a1?auto=format&fit=crop&q=80&w=800' },
    { name: 'Faisalabad', slug: 'faisalabad', isPopular: true, image: 'https://images.unsplash.com/photo-1622359511676-e82ea389bc7f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Multan', slug: 'multan', isPopular: true, image: 'https://images.unsplash.com/photo-1621517036662-79011be174e9?auto=format&fit=crop&q=80&w=800' }
];

async function seedCities() {
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

        for (const city of cities) {
            const checkRes = await client.query('SELECT id FROM cities WHERE slug = $1', [city.slug]);

            if (checkRes.rows.length === 0) {
                const id = uuidv4();
                await client.query(
                    'INSERT INTO cities (id, name, slug, hero_image_url, is_popular, display_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
                    [id, city.name, city.slug, city.image, city.isPopular, 0]
                );
                console.log(`Inserted city: ${city.name}`);
            } else {
                await client.query(
                    'UPDATE cities SET is_popular = $1, hero_image_url = $2 WHERE slug = $3',
                    [city.isPopular, city.image, city.slug]
                );
                console.log(`Updated city: ${city.name}`);
            }
        }

        console.log('City seeding completed successfully!');
    } catch (err) {
        console.error('Error during city seeding:', err.message);
    } finally {
        await client.end();
    }
}

seedCities();
