-- ============================================================================
-- STRIPE SUBSCRIPTION PLANS SEED SCRIPT
-- ============================================================================

-- Ensure the 'subscription_plans' table exists (usually handled by TypeORM sync)
-- This script uses UPSERT logic (ON CONFLICT) to prevent duplicates and allow updates.

INSERT INTO subscription_plans (
    id, 
    name, 
    plan_type, 
    description, 
    price, 
    billing_cycle, 
    features, 
    max_listings, 
    is_featured, 
    is_sponsored, 
    analytics_enabled, 
    priority_support, 
    is_active, 
    stripe_price_id
) VALUES 
-- 1. Free Plan
(
    '00000000-0000-0000-0000-000000000001', 
    'Free Starter', 
    'free', 
    'Essential tools for small local businesses starting out.', 
    0.00, 
    'monthly', 
    '["1 Business Listing", "Basic Search Discovery", "Email Support", "5 Photo Gallery"]'::jsonb, 
    1, 
    false, 
    false, 
    false, 
    false, 
    true, 
    NULL -- No Stripe price for free tier unless you use a $0 price
),
-- 2. Basic / Professional Plan
(
    '00000000-0000-0000-0000-000000000002', 
    'Professional', 
    'basic', 
    'Everything you need to dominate your local market.', 
    49.00, 
    'monthly', 
    '["10 Business Listings", "Priority Discovery", "Featured Badge", "Unlimited Photos", "WhatsApp Integration", "Lead Exports"]'::jsonb, 
    10, 
    true, 
    false, 
    true, 
    true, 
    true, 
    'price_H6k2abc123Test' -- REPLACE WITH YOUR REAL STRIPE PRICE ID
),
-- 3. Premium / Enterprise Plan
(
    '00000000-0000-0000-0000-000000000003', 
    'Enterprise', 
    'premium', 
    'For multi-location brands and high-volume agencies.', 
    199.00, 
    'monthly', 
    '["Unlimited Listings", "Global Featured Banner", "API Access", "Dedicated Manager", "Custom Analytics", "White-label Reports"]'::jsonb, 
    9999, 
    false, 
    true, 
    true, 
    true, 
    true, 
    'price_H6k2xyz789Test' -- REPLACE WITH YOUR REAL STRIPE PRICE ID
)
ON CONFLICT (plan_type) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    max_listings = EXCLUDED.max_listings,
    is_featured = EXCLUDED.is_featured,
    stripe_price_id = COALESCE(subscription_plans.stripe_price_id, EXCLUDED.stripe_price_id), -- Don't overwrite if already set in DB manually
    updated_at = NOW();
