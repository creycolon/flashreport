-- Add phone and address fields to partners table for profile
ALTER TABLE partners ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS address TEXT;

-- Create indexes for phone lookup
CREATE INDEX IF NOT EXISTS idx_partners_phone ON partners(phone);
