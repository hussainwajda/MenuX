-- Add missing columns to restaurants table (entity was updated, table was not)
-- Run this in your database (e.g. Supabase SQL Editor) if you get:
--   ERROR: column "is_active" of relation "restaurants" does not exist
--   ERROR: column "subscription_plan" of relation "restaurants" does not exist

-- is_active (boolean, maps from Restaurant.isActive)
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- subscription_plan (enum stored as VARCHAR, values: BASIC, PRO, PRO_PLUS, ULTRA)
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) NOT NULL DEFAULT 'BASIC';
