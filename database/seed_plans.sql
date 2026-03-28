-- ============================================================================
-- STRIPE SUBSCRIPTION PLANS SEED SCRIPT
-- ============================================================================
-- Two plans: Free (no credit card) and Basic (PKR 2,000/month via Stripe)
-- Stripe Product: prod_UEDZlUow2dsG0G  (Basic Vendor Plan)
-- Stripe Price:   price_1TFl84B8g7hLDd8UNvtGDhrg  (PKR 2,000/month recurring)
-- Run this script against the production DB to upsert the canonical plans.
-- ============================================================================

INSERT INTO subscription_plans (
    id,
    name,
    plan_type,
    description,
    price,
    billing_cycle,
    dashboard_features,
    max_listings,
    is_featured,
    is_active,
    stripe_price_id
) VALUES
-- ── 1. Free Plan ────────────────────────────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000001',
    'Free',
    'free',
    'Get your business online with a basic profile. No credit card required.',
    0.00,
    'monthly',
    '{
        "showListings":   true,
        "canAddListing":  true,
        "showSaved":      false,
        "showFollowing":  false,
        "showQueries":    false,
        "showLeads":      false,
        "showOffers":     false,
        "showReviews":    false,
        "showAnalytics":  false,
        "showChat":       false,
        "showBroadcast":  false,
        "maxKeywords":    0
    }'::jsonb,
    1,       -- max_listings
    false,   -- is_featured
    true,    -- is_active
    NULL     -- no Stripe price for the free tier
),
-- ── 2. Basic Plan ───────────────────────────────────────────────────────────
(
    '00000000-0000-0000-0000-000000000003',
    'Basic',
    'basic',
    'Full access to every feature. Grow your local presence with unlimited listings, analytics, and direct customer engagement.',
    2000.00,
    'monthly',
    '{
        "showListings":   true,
        "canAddListing":  true,
        "showSaved":      true,
        "showFollowing":  true,
        "showQueries":    true,
        "showLeads":      true,
        "showOffers":     true,
        "showReviews":    true,
        "showAnalytics":  true,
        "showChat":       true,
        "showBroadcast":  true,
        "maxKeywords":    10
    }'::jsonb,
    999,     -- max_listings (effectively unlimited)
    true,    -- is_featured
    true,    -- is_active
    'price_1TFl84B8g7hLDd8UNvtGDhrg'  -- Stripe: PKR 2,000/month recurring
)
ON CONFLICT (id) DO UPDATE SET
    name              = EXCLUDED.name,
    plan_type         = EXCLUDED.plan_type,
    description       = EXCLUDED.description,
    price             = EXCLUDED.price,
    billing_cycle     = EXCLUDED.billing_cycle,
    dashboard_features = EXCLUDED.dashboard_features,
    max_listings      = EXCLUDED.max_listings,
    is_featured       = EXCLUDED.is_featured,
    is_active         = EXCLUDED.is_active,
    -- Only overwrite stripe_price_id if the seeded value is non-null
    -- (preserves any manually set production value)
    stripe_price_id   = COALESCE(EXCLUDED.stripe_price_id, subscription_plans.stripe_price_id),
    updated_at        = NOW();

-- Deactivate any other plans that are not part of the official set
UPDATE subscription_plans
SET is_active = false, updated_at = NOW()
WHERE id NOT IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003'
);
