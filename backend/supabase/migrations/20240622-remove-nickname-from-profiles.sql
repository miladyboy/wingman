-- Migration: Drop nickname column from profiles if it exists
ALTER TABLE profiles DROP COLUMN IF EXISTS nickname;
-- To revert this migration, you can re-add the column with:
-- ALTER TABLE profiles ADD COLUMN nickname text;
