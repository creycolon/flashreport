-- Add supabase_id to partners table to link with Supabase Auth
ALTER TABLE partners ADD COLUMN IF NOT EXISTS supabase_id UUID UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_partners_supabase_id ON partners(supabase_id);
