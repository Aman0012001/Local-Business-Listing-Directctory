-- ============================================================================
-- FIX: Clear stale Stripe Customer IDs from all vendor records
-- ============================================================================
-- Run this once against your production DB.
-- The backend will auto-create fresh Stripe customers on the next checkout.
--
-- Background: Stripe Customer IDs like "cus_UDgeipy9ZYMlUp" are environment-
-- specific (test vs live) and account-specific. If the Stripe account or
-- environment was changed, all stored IDs become invalid.
-- ============================================================================

-- Show what will be cleared before running
SELECT id, "businessName", "stripeCustomerId"
FROM vendors
WHERE "stripeCustomerId" IS NOT NULL;

-- Clear ALL stale customer IDs so the backend recreates them fresh
UPDATE vendors
SET "stripeCustomerId" = NULL,
    "updatedAt"        = NOW()
WHERE "stripeCustomerId" IS NOT NULL;

-- Confirm
SELECT COUNT(*) AS vendors_cleared FROM vendors WHERE "stripeCustomerId" IS NULL;
