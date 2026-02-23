-- Add email to partners table to sync with Supabase Auth
ALTER TABLE partners ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
