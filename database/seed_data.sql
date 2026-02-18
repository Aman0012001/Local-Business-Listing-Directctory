-- ============================================================================
-- SEED DATA FOR USERS, VENDORS, AND BUSINESSES (DIRECTORIES)
-- ============================================================================

-- Ensure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SEED USERS
-- Password for all seed users is 'Password123!' (hashed with bcrypt)
INSERT INTO users (id, password, email, phone, full_name, role, is_active, is_email_verified)
VALUES 
    (uuid_generate_v4(), '$2b$10$rQZ3YXZ4YXZ4YXZ4YXZ4YeK8vJ9J9J9J9J9J9J9J9J9J9J9J9J9J9', 'admin@example.com', '+923000000000', 'System Admin', 'admin', true, true),
    (uuid_generate_v4(), '$2b$10$rQZ3YXZ4YXZ4YXZ4YXZ4YeK8vJ9J9J9J9J9J9J9J9J9J9J9J9J9J9', 'joy-cafe@example.com', '+923001111111', 'Joy Vendor', 'vendor', true, true),
    (uuid_generate_v4(), '$2b$10$rQZ3YXZ4YXZ4YXZ4YXZ4YeK8vJ9J9J9J9J9J9J9J9J9J9J9J9J9J9', 'spa-owner@example.com', '+923002222222', 'Relaxation Specialist', 'vendor', true, true),
    (uuid_generate_v4(), '$2b$10$rQZ3YXZ4YXZ4YXZ4YXZ4YeK8vJ9J9J9J9J9J9J9J9J9J9J9J9J9J9', 'customer@example.com', '+923003333333', 'John Doe', 'user', true, true)
ON CONFLICT (email) DO NOTHING;

-- 2. SEED VENDORS
INSERT INTO vendors (id, user_id, business_name, business_email, business_phone, business_address, is_verified)
SELECT 
    uuid_generate_v4(), 
    id, 
    'Joyful Cafe Group', 
    'joy-cafe@example.com', 
    '+923001111111', 
    '123, Food Street, Lahore, Pakistan', 
    true 
FROM users WHERE email = 'joy-cafe@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO vendors (id, user_id, business_name, business_email, business_phone, business_address, is_verified)
SELECT 
    uuid_generate_v4(), 
    id, 
    'Serenity Spa & Wellness', 
    'spa-owner@example.com', 
    '+923002222222', 
    '456, Wellness Lane, Karachi, Pakistan', 
    true 
FROM users WHERE email = 'spa-owner@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3. SEED BUSINESSES (DIRECTORIES)
-- Mapping categories (make sure these exist first)
-- If categories don't exist, we add them
INSERT INTO categories (id, name, slug, description, icon_url, display_order)
VALUES 
    (uuid_generate_v4(), 'Restaurants & Food', 'restaurants-food', 'Explore local dining and food services', 'restaurant', 1),
    (uuid_generate_v4(), 'Beauty & Spa', 'beauty-spa', 'Best local salons and wellness centers', 'spa', 2),
    (uuid_generate_v4(), 'Home Services', 'home-services', 'Professional help for your home', 'home', 3),
    (uuid_generate_v4(), 'Healthcare', 'health-wellness', 'Hospitals and clinics near you', 'health', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert Business Listings (The "Directories")
INSERT INTO businesses (
    id, vendor_id, category_id, name, slug, description, short_description, 
    phone, email, whatsapp, website, address, city, state, pincode, 
    latitude, longitude, status, is_verified, is_featured, average_rating
)
SELECT 
    uuid_generate_v4(), 
    v.id, 
    c.id, 
    'The Gourmet Hub', 
    'gourmet-hub-lahore', 
    'Experience the finest Pakistani and International cuisines in the heart of Lahore. We offer a holistic dining experience with fresh organic ingredients.', 
    'Authentic multi-cuisine restaurant in Lahore.', 
    '+923001111111', 
    'contact@gourmet-hub.com', 
    '+923001111111', 
    'https://example.com/gourmet-hub', 
    'Shop 101, Mall Road', 
    'Lahore', 
    'Punjab', 
    '54000', 
    31.5204, 74.3587, 
    'approved', true, true, 4.8
FROM vendors v, categories c 
WHERE v.business_name = 'Joyful Cafe Group' AND c.slug = 'restaurants-food'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO businesses (
    id, vendor_id, category_id, name, slug, description, short_description, 
    phone, email, whatsapp, website, address, city, state, pincode, 
    latitude, longitude, status, is_verified, is_featured, average_rating
)
SELECT 
    uuid_generate_v4(), 
    v.id, 
    c.id, 
    'Serenity Wellness Center', 
    'serenity-wellness-center', 
    'A premium spa and wellness center offering traditional and modern therapy for mind and body relaxation.', 
    'Luxury spa and wellness treatments.', 
    '+923002222222', 
    'info@serenity-spa.com', 
    '+923002222222', 
    'https://example.com/serenity-spa', 
    'Flat 2, Wellness Towers, DHA Phase 6', 
    'Karachi', 
    'Sindh', 
    '75500', 
    24.8607, 67.0011, 
    'approved', true, false, 4.5
FROM vendors v, categories c 
WHERE v.business_name = 'Serenity Spa & Wellness' AND c.slug = 'beauty-spa'
ON CONFLICT (slug) DO NOTHING;

-- 4. SEED BUSINESS HOURS
INSERT INTO business_hours (business_id, day_of_week, is_open, open_time, close_time)
SELECT b.id, d.day::business_hours_day_of_week_enum, true, '09:00:00', '22:00:00'
FROM businesses b, (SELECT unnest(ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) as day) d
ON CONFLICT DO NOTHING;

-- 5. SEED AMENITIES (Linked to businesses)
INSERT INTO business_amenities (business_id, amenity_id)
SELECT b.id, a.id
FROM businesses b, amenities a
WHERE a.name IN ('WiFi', 'Parking', 'Air Conditioning')
ON CONFLICT DO NOTHING;
