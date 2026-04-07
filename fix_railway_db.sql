-- SQL Migration to fix missing columns in subscription_plans table
-- Run this in your Railway PostgreSQL console if the backend is still crashing with "column does not exist" errors.

-- 1. Add dashboard_features column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscription_plans' AND column_name='dashboard_features') THEN
        ALTER TABLE subscription_plans ADD COLUMN dashboard_features JSONB DEFAULT '{}';
    END IF;
END $$;

-- 2. Add is_featured column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscription_plans' AND column_name='is_featured') THEN
        ALTER TABLE subscription_plans ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Add plan_type if it was renamed/missing (check for both plan_type and planType)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscription_plans' AND column_name='plan_type') THEN
        -- If planType exists (from a bad synchronize), rename it
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscription_plans' AND column_name='planType') THEN
            ALTER TABLE subscription_plans RENAME COLUMN "planType" TO plan_type;
        ELSE
            ALTER TABLE subscription_plans ADD COLUMN plan_type VARCHAR(50) DEFAULT 'free';
        END IF;
    END IF;
END $$;

-- Notify
SELECT 'Database schema fix applied successfully' as status;
