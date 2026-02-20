-- Migration: Add auto-increment sequence_number to cash_movements
-- Run this in Supabase SQL Editor

-- Add a sequence for sequence_number
CREATE SEQUENCE IF NOT EXISTS cash_movements_seq_num;

-- Add default value for sequence_number
ALTER TABLE cash_movements 
ALTER COLUMN sequence_number SET DEFAULT nextval('cash_movements_seq_num');

-- Set sequence to start from current max + 1
SELECT setval('cash_movements_seq_num', COALESCE((SELECT MAX(sequence_number) FROM cash_movements), 0) + 1);

-- Show current sequence value
SELECT last_value as current_seq FROM cash_movements_seq_num;

SELECT '✅ Sequence configured for cash_movements.sequence_number' as message;
