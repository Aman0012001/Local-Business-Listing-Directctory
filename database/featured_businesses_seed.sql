-- ============================================================================
-- SEED 10 FEATURED BUSINESSES WITH COMPLETE DETAILS
-- ============================================================================

DO $$
DECLARE
    v_vendor_id UUID;
    v_cat_food UUID;
    v_cat_spa UUID;
    v_cat_home UUID;
    v_cat_health UUID;
    v_cat_auto UUID;
    v_cat_edu UUID;
    v_user_id UUID;
BEGIN
    -- 1. Create a Premium Vendor User if not exists
    v_user_id := uuid_generate_v4();
    INSERT INTO users (id, email, password, full_name, role, is_active, is_email_verified)
    VALUES (v_user_id, 'premium-vendor@example.com', '$2b$10$rQZ3YXZ4YXZ4YXZ4YXZ4YeK8vJ9J9J9J9J9J9J9J9J9J9J9J9J9J9', 'Premium Vendor Elite', 'vendor', true, true)
    ON CONFLICT (email) DO UPDATE SET role = 'vendor'
    RETURNING id INTO v_user_id;

    -- 2. Create Vendor Profile
    INSERT INTO vendors (user_id, business_name, business_email, business_phone, business_address, is_verified)
    VALUES (v_user_id, 'Elite Business Group', 'elite@example.com', '+911234567890', 'Aura District, Business Hub, Mumbai', true)
    ON CONFLICT (user_id) DO UPDATE SET is_verified = true
    RETURNING id INTO v_vendor_id;

    -- 3. Get Category IDs
    SELECT id INTO v_cat_food FROM categories WHERE slug = 'restaurants-food';
    SELECT id INTO v_cat_spa FROM categories WHERE slug = 'beauty-spa';
    SELECT id INTO v_cat_home FROM categories WHERE slug = 'home-services';
    SELECT id INTO v_cat_health FROM categories WHERE slug = 'health-wellness';
    SELECT id INTO v_cat_auto FROM categories WHERE slug = 'automotive';
    SELECT id INTO v_cat_edu FROM categories WHERE slug = 'education';

    -- 4. INSERT 10 FEATURED BUSINESSES
    
    -- 1. Sky Lounge & Bar
    INSERT INTO businesses (vendor_id, category_id, name, slug, description, short_description, phone, email, website, address, city, state, pincode, latitude, longitude, status, is_verified, is_featured, average_rating, cover_image_url, images)
    VALUES (v_vendor_id, v_cat_food, 'Sky Lounge & Bar', 'sky-lounge-mumbai', 'Experience fine dining with a panoramic view of the Mumbai skyline. Our chefs specialize in rooftop fusion cuisine.', 'Premium rooftop dining with skyline views.', '+911111111111', 'sky@lounge.com', 'https://skylounge.com', '77th Floor, World Tower, Worli', 'Mumbai', 'Maharashtra', '400018', 18.9986, 72.8252, 'approved', true, true, 4.9, 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=1200', '["https://images.unsplash.com/photo-1514361892635-6b07e31e75f9", "https://images.unsplash.com/photo-1503951914875-452162b0f3f1"]')
    ON CONFLICT (slug) DO NOTHING;

    -- 2. Aura Luxury Spa
    INSERT INTO businesses (vendor_id, category_id, name, slug, description, short_description, phone, email, website, address, city, state, pincode, latitude, longitude, status, is_verified, is_featured, average_rating, cover_image_url, images)
    VALUES (v_vendor_id, v_cat_spa, 'Aura Luxury Spa', 'aura-luxury-spa-bandra', 'Rejuvenate your senses with our elite therapies and holistic wellness treatments. The best spa experience in Bandra.', 'Elite spa and holistic wellness center.', '+912222222222', 'info@auraspa.com', 'https://auraspa.com', 'Turner Road, Bandra West', 'Mumbai', 'Maharashtra', '400050', 19.0621, 72.8315, 'approved', true, true, 4.8, 'https://images.unsplash.com/photo-1544161515-4af6b1d46152?w=1200', '["https://images.unsplash.com/photo-1544161515-4af6b1d46152", "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069"]')
    ON CONFLICT (slug) DO NOTHING;

    -- 3. TechFix Home Solutions
    INSERT INTO businesses (vendor_id, category_id, name, slug, description, short_description, phone, email, website, address, city, state, pincode, latitude, longitude, status, is_verified, is_featured, average_rating, cover_image_url, images)
    VALUES (v_vendor_id, v_cat_home, 'TechFix Home Solutions', 'techfix-home-solutions', 'Professional home automation and gadget repair services at your doorstep. Fast, reliable, and verified.', 'Smart home and electronics repair services.', '+913333333333', 'help@techfix.com', 'https://techfix.com', 'Shop 4, Linking Road, Santacruz', 'Mumbai', 'Maharashtra', '400054', 19.0821, 72.8355, 'approved', true, true, 4.7, 'https://images.unsplash.com/photo-1581092921461-7d6575975554?w=1200', '["https://images.unsplash.com/photo-1550751827-4bd374c3f58b"]')
    ON CONFLICT (slug) DO NOTHING;

    -- 4. Zenith Fitness Elite
    INSERT INTO businesses (vendor_id, category_id, name, slug, description, short_description, phone, email, website, address, city, state, pincode, latitude, longitude, status, is_verified, is_featured, average_rating, cover_image_url, images)
    VALUES (v_vendor_id, v_cat_health, 'Zenith Fitness Elite', 'zenith-fitness-elite', 'Modern gym with world-class equipment and personal trainers. Achieve your fitness goals with Aura-verified experts.', 'World-class fitness and training center.', '+914444444444', 'fit@zenith.com', 'https://zenithfitness.com', 'Main Tower, Powai', 'Mumbai', 'Maharashtra', '400076', 19.1190, 72.9050, 'approved', true, true, 4.9, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200', '["https://images.unsplash.com/photo-1534438327276-14e5300c3a48", "https://images.unsplash.com/photo-1571902943202-507ec2618e8f"]')
    ON CONFLICT (slug) DO NOTHING;

    -- 5. Rapid Auto Care
    INSERT INTO businesses (vendor_id, category_id, name, slug, description, short_description, phone, email, website, address, city, state, pincode, latitude, longitude, status, is_verified, is_featured, average_rating, cover_image_url, images)
    VALUES (v_vendor_id, v_cat_auto, 'Rapid Auto Care', 'rapid-auto-care', 'Precision car servicing and detailing. We use advanced diagnostic tools to keep your ride in top condition.', 'Advanced car servicing and detailing.', '+915555555555', 'auto@rapid.com', 'https://rapidauto.com', 'MIDC Industrial Area, Andheri East', 'Mumbai', 'Maharashtra', '400093', 19.1155, 72.8665, 'approved', true, true, 4.6, 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=1200', '["https://images.unsplash.com/photo-1486006920555-c77dcf18193c", "https://images.unsplash.com/photo-1530046339160-ce3e5b0c7a2f"]')
    ON CONFLICT (slug) DO NOTHING;

    -- 6. Byte Code Academy
    INSERT INTO businesses (vendor_id, category_id, name, slug, description, short_description, phone, email, website, address, city, state, pincode, latitude, longitude, status, is_verified, is_featured, average_rating, cover_image_url, images)
    VALUES (v_vendor_id, v_cat_edu, 'Byte Code Academy', 'byte-code-academy', 'Learn coding from industry experts. Master Full Stack Development, AI, and Blockchain in our premium facility.', 'Elite coding and tech training academy.', '+916666666666', 'learn@bytecode.com', 'https://bytecode.com', 'Hiranandani Gardens, Powai', 'Mumbai', 'Maharashtra', '400076', 19.1170, 72.9110, 'approved', true, true, 4.8, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200', '["https://images.unsplash.com/photo-1531482615713-2afd69097998"]')
    ON CONFLICT (slug) DO NOTHING;

    -- 7. Crystal Vision Eye Care
    INSERT INTO businesses (vendor_id, category_id, name, slug, description, short_description, phone, email, website, address, city, state, pincode, latitude, longitude, status, is_verified, is_featured, average_rating, cover_image_url, images)
    VALUES (v_vendor_id, v_cat_health, 'Crystal Vision Eye Care', 'crystal-vision-eye-care', 'Comprehensive eye care services and premium eyewear. Advanced laser surgery and verified optometrists.', 'Advanced ophthalmology and eye care.', '+917777777777', 'vision@crystal.com', 'https://crystalvision.com', 'Gokhale Road, Dadar West', 'Mumbai', 'Maharashtra', '400028', 19.0199, 72.8399, 'approved', true, true, 4.7, 'https://images.unsplash.com/photo-1513222359380-aa35a7ef6407?w=1200', '["https://images.unsplash.com/photo-1576091160550-2173dba999ef"]')
    ON CONFLICT (slug) DO NOTHING;

    -- 8. Urban Green Nursery
    INSERT INTO businesses (vendor_id, category_id, name, slug, description, short_description, phone, email, website, address, city, state, pincode, latitude, longitude, status, is_verified, is_featured, average_rating, cover_image_url, images)
    VALUES (v_vendor_id, v_cat_home, 'Urban Green Nursery', 'urban-green-nursery', 'Transform your home into an oasis. We provide rare indoor plants, succulents, and landscaping services.', 'Premium plants and landscaping services.', '+918888888888', 'hello@urbangreen.com', 'https://urbangreen.com', 'Film City Road, Goregaon East', 'Mumbai', 'Maharashtra', '400063', 19.1666, 72.8850, 'approved', true, true, 4.5, 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1200', '["https://images.unsplash.com/photo-1463936575829-25148e1db1b8", "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc"]')
    ON CONFLICT (slug) DO NOTHING;

    -- 9. Blue Water Resort
    INSERT INTO businesses (vendor_id, category_id, name, slug, description, short_description, phone, email, website, address, city, state, pincode, latitude, longitude, status, is_verified, is_featured, average_rating, cover_image_url, images)
    VALUES (v_vendor_id, v_cat_food, 'Blue Water Resort', 'blue-water-resort-vasai', 'Escape the city chaos. Luxury waterfront resort with pool parties and five-star accommodation.', 'Luxury waterfront resort and dining.', '+919999999999', 'stay@bluewater.com', 'https://bluewater.com', 'Arnala Beach, Vasai West', 'Vasai', 'Maharashtra', '401301', 19.3800, 72.7483, 'approved', true, true, 4.8, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200', '["https://images.unsplash.com/photo-1540541338287-41700207dee6", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]')
    ON CONFLICT (slug) DO NOTHING;

    -- 10. Modern Living Designs
    INSERT INTO businesses (vendor_id, category_id, name, slug, description, short_description, phone, email, website, address, city, state, pincode, latitude, longitude, status, is_verified, is_featured, average_rating, cover_image_url, images)
    VALUES (v_vendor_id, v_cat_home, 'Modern Living Designs', 'modern-living-designs', 'Bespoke furniture and interior design services for luxury homes. Aura-verified quality and craftsmanship.', 'Premium interior design and furniture.', '+911010101010', 'design@modernliving.com', 'https://modernliving.com', 'Laxmi Industrial Estate, Andheri West', 'Mumbai', 'Maharashtra', '400053', 19.1300, 72.8250, 'approved', true, true, 4.9, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200', '["https://images.unsplash.com/photo-1524758631624-e2822e304c36", "https://images.unsplash.com/photo-1519710164239-da123dc03ef4"]')
    ON CONFLICT (slug) DO NOTHING;

END $$;

-- 5. SEED BUSINESS HOURS FOR ALL NEW BUSINESSES
INSERT INTO business_hours (business_id, day_of_week, is_open, open_time, close_time)
SELECT b.id, d.day, true, '09:00:00', '21:00:00'
FROM businesses b, (SELECT unnest(ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']::day_of_week[]) as day) d
WHERE b.is_featured = true
ON CONFLICT (business_id, day_of_week) DO NOTHING;

-- 6. SEED AMENITIES FOR ALL NEW BUSINESSES
INSERT INTO business_amenities (business_id, amenity_id)
SELECT b.id, a.id 
FROM businesses b, amenities a 
WHERE b.is_featured = true AND a.name IN ('WiFi', 'Parking', 'Air Conditioning', 'Credit Cards')
ON CONFLICT (business_id, amenity_id) DO NOTHING;
