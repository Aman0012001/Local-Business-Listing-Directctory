-- ============================================================================
-- LOCAL BUSINESS DISCOVERY PLATFORM - DATABASE SCHEMA
-- PostgreSQL 15+ with PostGIS Extension
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "postgis"; -- Commented out: requires PostGIS installation
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('user', 'vendor', 'admin');
CREATE TYPE business_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE lead_type AS ENUM ('call', 'whatsapp', 'email', 'chat', 'website');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'converted', 'lost');
CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'premium', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'suspended');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    password VARCHAR(255), -- For local auth
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- VENDORS TABLE
-- ============================================================================

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255),
    business_phone VARCHAR(20) NOT NULL,
    business_address TEXT,
    gst_number VARCHAR(15),
    pan_number VARCHAR(10),
    is_verified BOOLEAN DEFAULT false,
    verification_documents JSONB, -- Store document URLs
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_vendors_verified ON vendors(is_verified);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);

-- ============================================================================
-- BUSINESSES TABLE
-- ============================================================================

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Contact
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    website VARCHAR(255),
    
    -- Location
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    -- location GEOGRAPHY(POINT, 4326), -- Commented out: requires PostGIS extension
    
    -- Media
    logo_url TEXT,
    cover_image_url TEXT,
    images JSONB DEFAULT '[]', -- Array of image URLs
    videos JSONB DEFAULT '[]', -- Array of video URLs
    
    -- Business Details
    year_established INTEGER,
    employee_count VARCHAR(50),
    price_range VARCHAR(10), -- $, $$, $$$, $$$$
    
    -- Status & Ratings
    status business_status DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_sponsored BOOLEAN DEFAULT false,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_leads INTEGER DEFAULT 0,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    
    -- Timestamps
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for businesses
CREATE INDEX idx_businesses_vendor_id ON businesses(vendor_id);
CREATE INDEX idx_businesses_category_id ON businesses(category_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_pincode ON businesses(pincode);
CREATE INDEX idx_businesses_rating ON businesses(average_rating DESC);
CREATE INDEX idx_businesses_featured ON businesses(is_featured);
CREATE INDEX idx_businesses_sponsored ON businesses(is_sponsored);

-- Spatial index for location-based queries
-- CREATE INDEX idx_businesses_location ON businesses USING GIST(location); -- Requires PostGIS

-- Full-text search index
CREATE INDEX idx_businesses_name_trgm ON businesses USING GIN(name gin_trgm_ops);
CREATE INDEX idx_businesses_description_trgm ON businesses USING GIN(description gin_trgm_ops);

-- ============================================================================
-- BUSINESS HOURS TABLE
-- ============================================================================

CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    is_open BOOLEAN DEFAULT true,
    open_time TIME,
    close_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, day_of_week)
);

CREATE INDEX idx_business_hours_business_id ON business_hours(business_id);

-- ============================================================================
-- BUSINESS AMENITIES TABLE
-- ============================================================================

CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE business_amenities (
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (business_id, amenity_id)
);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    images JSONB DEFAULT '[]',
    helpful_count INTEGER DEFAULT 0,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    vendor_response TEXT,
    vendor_response_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, user_id) -- One review per user per business
);

CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================================================
-- REVIEW HELPFUL VOTES TABLE
-- ============================================================================

CREATE TABLE review_helpful_votes (
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id, user_id)
);

-- ============================================================================
-- LEADS TABLE
-- ============================================================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Lead Info
    type lead_type NOT NULL,
    status lead_status DEFAULT 'new',
    
    -- Contact Info (for non-authenticated users)
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    message TEXT,
    
    -- Metadata
    source VARCHAR(50), -- web, mobile, api
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    
    -- Tracking
    contacted_at TIMESTAMP,
    converted_at TIMESTAMP,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leads_business_id ON leads(business_id);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_type ON leads(type);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- ============================================================================
-- FAVORITES TABLE
-- ============================================================================

CREATE TABLE favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, business_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_business_id ON favorites(business_id);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    plan_type subscription_plan NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    features JSONB NOT NULL, -- JSON array of features
    max_listings INTEGER DEFAULT 1,
    is_featured BOOLEAN DEFAULT false,
    is_sponsored BOOLEAN DEFAULT false,
    analytics_enabled BOOLEAN DEFAULT false,
    priority_support BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    stripe_price_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status subscription_status DEFAULT 'active',
    
    -- Stripe
    stripe_subscription_id VARCHAR(255),
    
    -- Billing
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    
    -- Payment
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Metadata
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_vendor_id ON subscriptions(vendor_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50), -- card, upi, netbanking, wallet
    payment_gateway VARCHAR(50), -- razorpay, stripe, etc.
    gateway_transaction_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    
    -- Status
    status payment_status DEFAULT 'pending',
    
    -- Invoice
    invoice_number VARCHAR(50) UNIQUE,
    invoice_url TEXT,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    paid_at TIMESTAMP,
    failed_at TIMESTAMP,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_subscription_id ON transactions(subscription_id);
CREATE INDEX idx_transactions_vendor_id ON transactions(vendor_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_invoice_number ON transactions(invoice_number);

-- ============================================================================
-- ANALYTICS TABLE
-- ============================================================================

CREATE TABLE business_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Metrics
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    calls INTEGER DEFAULT 0,
    whatsapp_clicks INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,
    website_clicks INTEGER DEFAULT 0,
    direction_clicks INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, date)
);

CREATE INDEX idx_analytics_business_id ON business_analytics(business_id);
CREATE INDEX idx_analytics_date ON business_analytics(date DESC);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- review, lead, subscription, system
    data JSONB, -- Additional data
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update business location point when lat/lng changes
-- CREATE OR REPLACE FUNCTION update_business_location()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER update_businesses_location 
-- BEFORE INSERT OR UPDATE OF latitude, longitude ON businesses 
-- FOR EACH ROW EXECUTE FUNCTION update_business_location();

-- Update business average rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses
    SET 
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE business_id = COALESCE(NEW.business_id, OLD.business_id) AND is_approved = true),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE business_id = COALESCE(NEW.business_id, OLD.business_id) AND is_approved = true)
    WHERE id = COALESCE(NEW.business_id, OLD.business_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- 1. Default Subscription Plans
INSERT INTO subscription_plans (name, plan_type, description, price, features, max_listings, is_featured, is_sponsored, analytics_enabled, priority_support) VALUES
('Free Plan', 'free', 'Basic listing for small businesses', 0.00, '["Basic listing", "Contact details", "Business hours", "Photos (up to 5)"]', 1, false, false, false, false),
('Basic Plan', 'basic', 'Enhanced visibility for growing businesses', 499.00, '["Everything in Free", "Featured badge", "Up to 10 photos", "Basic analytics", "Priority in search"]', 3, true, false, true, false),
('Premium Plan', 'premium', 'Maximum exposure for established businesses', 999.00, '["Everything in Basic", "Sponsored listings", "Unlimited photos", "Advanced analytics", "Priority support", "Remove competitors"]', 10, true, true, true, true),
('Enterprise Plan', 'enterprise', 'Custom solution for large businesses', 2499.00, '["Everything in Premium", "Dedicated account manager", "API access", "Custom integrations", "White-label options"]', 50, true, true, true, true)
ON CONFLICT (plan_type) DO NOTHING;

-- 2. Default Amenities
INSERT INTO amenities (name, icon) VALUES
('WiFi', 'wifi'),
('Parking', 'parking'),
('Wheelchair Accessible', 'wheelchair'),
('Pet Friendly', 'pet'),
('Air Conditioning', 'ac'),
('Outdoor Seating', 'outdoor'),
('Delivery', 'delivery'),
('Takeaway', 'takeaway'),
('Credit Cards', 'card'),
('Cash Only', 'cash')
ON CONFLICT (name) DO NOTHING;

-- 3. Default Categories
INSERT INTO categories (name, slug, description, icon_url, display_order) VALUES
('Restaurants & Food', 'restaurants-food', 'Explore local dining and food services', 'restaurant', 1),
('Beauty & Spa', 'beauty-spa', 'Best local salons and wellness centers', 'spa', 2),
('Home Services', 'home-services', 'Professional help for your home', 'home', 3),
('Healthcare', 'health-wellness', 'Hospitals and clinics near you', 'health', 4),
('Automotive', 'automotive', 'Car repair and services', 'car', 5),
('Education', 'education', 'Schools, coaches and training', 'school', 6)
ON CONFLICT (slug) DO NOTHING;

-- 4. Sample Users, Vendors, and Businesses are seeded via seed_data.sql

-- 5. Business Hours (Cartesian join for all 7 days for sample businesses)
INSERT INTO business_hours (business_id, day_of_week, is_open, open_time, close_time)
SELECT b.id, d.day, true, '09:00:00', '21:00:00'
FROM businesses b, (SELECT unnest(ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']::day_of_week[]) as day) d
ON CONFLICT (business_id, day_of_week) DO NOTHING;

-- 8. Business Amenities
INSERT INTO business_amenities (business_id, amenity_id)
SELECT b.id, a.id FROM businesses b, amenities a WHERE a.name IN ('WiFi', 'Parking', 'Air Conditioning')
ON CONFLICT (business_id, amenity_id) DO NOTHING;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Active businesses view
CREATE VIEW active_businesses AS
SELECT 
    b.*,
    c.name as category_name,
    c.slug as category_slug,
    v.business_name as vendor_name,
    v.business_phone as vendor_phone
FROM businesses b
JOIN categories c ON b.category_id = c.id
JOIN vendors v ON b.vendor_id = v.id
WHERE b.status = 'approved' AND b.is_verified = true;

-- Business with subscription info
CREATE VIEW businesses_with_subscription AS
SELECT 
    b.*,
    s.status as subscription_status,
    sp.plan_type,
    sp.name as plan_name
FROM businesses b
JOIN vendors v ON b.vendor_id = v.id
LEFT JOIN subscriptions s ON v.id = s.vendor_id AND s.status = 'active'
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Platform users (customers, vendors, admins)';
COMMENT ON TABLE vendors IS 'Business owners/vendors';
COMMENT ON TABLE businesses IS 'Business listings';
COMMENT ON TABLE reviews IS 'User reviews for businesses';
COMMENT ON TABLE leads IS 'Lead generation tracking';
COMMENT ON TABLE subscriptions IS 'Vendor subscription records';
COMMENT ON TABLE transactions IS 'Payment transactions';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
