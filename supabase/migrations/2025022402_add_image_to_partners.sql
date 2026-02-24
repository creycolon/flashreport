-- Add image field to partners table for profile photo
ALTER TABLE partners ADD COLUMN IF NOT EXISTS image TEXT;
