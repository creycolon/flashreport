-- Migration: Add auto-increment numeric IDs to all tables
-- Run this in Supabase SQL Editor

-- 1. Partners - add id_num with sequence
ALTER TABLE partners ADD COLUMN IF NOT EXISTS id_num BIGSERIAL;
ALTER TABLE partners ADD CONSTRAINT partners_pkey_new PRIMARY KEY (id_num);

-- 2. Partner Accounts - add id_num with sequence
ALTER TABLE partner_accounts ADD COLUMN IF NOT EXISTS id_num BIGSERIAL;
ALTER TABLE partner_accounts ADD CONSTRAINT partner_accounts_pkey_new PRIMARY KEY (id_num);

-- 3. Business Units - add id_num with sequence
ALTER TABLE business_units ADD COLUMN IF NOT EXISTS id_num BIGSERIAL;
ALTER TABLE business_units ADD CONSTRAINT business_units_pkey_new PRIMARY KEY (id_num);

-- 4. Movement Categories - add id_num with sequence
ALTER TABLE movement_categories ADD COLUMN IF NOT EXISTS id_num BIGSERIAL;
ALTER TABLE movement_categories ADD CONSTRAINT movement_categories_pkey_new PRIMARY KEY (id_num);

-- 5. Cash Movements - add id_num with sequence
ALTER TABLE cash_movements ADD COLUMN IF NOT EXISTS id_num BIGSERIAL;
ALTER TABLE cash_movements ADD CONSTRAINT cash_movements_pkey_new PRIMARY KEY (id_num);

-- 6. Partner Account Transactions - add id_num with sequence
ALTER TABLE partner_account_transactions ADD COLUMN IF NOT EXISTS id_num BIGSERIAL;
ALTER TABLE partner_account_transactions ADD CONSTRAINT partner_account_transactions_pkey_new PRIMARY KEY (id_num);

-- 7. App Config - add id_num with sequence
ALTER TABLE app_config ADD COLUMN IF NOT EXISTS id_num BIGSERIAL;
ALTER TABLE app_config ADD CONSTRAINT app_config_pkey_new PRIMARY KEY (id_num);

-- Set sequence to continue from existing max values
SELECT setval('partners_id_num_seq', (SELECT COALESCE(MAX(id_num), 0) FROM partners));
SELECT setval('partner_accounts_id_num_seq', (SELECT COALESCE(MAX(id_num), 0) FROM partner_accounts));
SELECT setval('business_units_id_num_seq', (SELECT COALESCE(MAX(id_num), 0) FROM business_units));
SELECT setval('movement_categories_id_num_seq', (SELECT COALESCE(MAX(id_num), 0) FROM movement_categories));
SELECT setval('cash_movements_id_num_seq', (SELECT COALESCE(MAX(id_num), 0) FROM cash_movements));
SELECT setval('partner_account_transactions_id_num_seq', (SELECT COALESCE(MAX(id_num), 0) FROM partner_account_transactions));
SELECT setval('app_config_id_num_seq', (SELECT COALESCE(MAX(id_num), 0) FROM app_config));

-- Show current sequences
SELECT 'partners' as table_name, last_value as last_id FROM partners_id_num_seq
UNION ALL
SELECT 'business_units', last_value FROM business_units_id_num_seq
UNION ALL
SELECT 'movement_categories', last_value FROM movement_categories_id_num_seq
UNION ALL
SELECT 'cash_movements', last_value FROM cash_movements_id_num_seq;

-- Show sample data with new IDs
SELECT 'Partners with new IDs:' as info;
SELECT id, id_num, name FROM partners LIMIT 5;

SELECT 'Business Units with new IDs:' as info;
SELECT id, id_num, name FROM business_units LIMIT 5;

SELECT 'Cash Movements with new IDs:' as info;
SELECT id, id_num, amount, business_unit_id FROM cash_movements LIMIT 5;

SELECT '✅ Migration completed! Use id_num for numeric sequential IDs' as message;
