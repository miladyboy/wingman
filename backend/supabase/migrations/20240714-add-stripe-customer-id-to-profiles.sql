-- Migration: Add stripe_customer_id to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text; 