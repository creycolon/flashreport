-- Flash Report - Complete Schema with Numeric Auto-increment IDs
-- Run this in Supabase SQL Editor
-- WARNING: This will DELETE all existing data!

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS partner_account_transactions CASCADE;
DROP TABLE IF EXISTS cash_movements CASCADE;
DROP TABLE IF EXISTS app_config CASCADE;
DROP TABLE IF EXISTS partner_accounts CASCADE;
DROP TABLE IF EXISTS movement_categories CASCADE;
DROP TABLE IF EXISTS business_units CASCADE;
DROP TABLE IF EXISTS partners CASCADE;

-- 1. Partners - using BIGINT auto-increment
CREATE TABLE partners (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    alias TEXT,
    participation_percentage DECIMAL(5,2) NOT NULL,
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_managing_partner BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Partner Accounts
CREATE TABLE partner_accounts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    partner_id BIGINT REFERENCES partners(id) ON DELETE CASCADE,
    current_balance DECIMAL(12,2) DEFAULT 0,
    negative_balance_flag BOOLEAN DEFAULT false,
    negative_balance_since TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Business Units
CREATE TABLE business_units (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    location TEXT,
    color TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Movement Categories
CREATE TABLE movement_categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('CR','DB','BOTH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Cash Movements (CORE TABLE)
CREATE TABLE cash_movements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_unit_id BIGINT REFERENCES business_units(id) ON DELETE CASCADE,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT CHECK (type IN ('CR','DB')),
    category_id BIGINT REFERENCES movement_categories(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    reference_id TEXT,
    partner_account_id BIGINT REFERENCES partner_accounts(id) ON DELETE SET NULL,
    created_by BIGINT REFERENCES partners(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    closed_period TEXT,
    sequence_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Partner Account Transactions
CREATE TABLE partner_account_transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    partner_account_id BIGINT REFERENCES partner_accounts(id) ON DELETE CASCADE,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT CHECK (type IN ('DB','CR')),
    origin TEXT CHECK (origin IN ('WITHDRAWAL','DISTRIBUTION','SETTLEMENT_PAYMENT','EXPENSE_REIMBURSEMENT','ADJUSTMENT')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    reference_id TEXT,
    created_by BIGINT REFERENCES partners(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. App Configuration
CREATE TABLE app_config (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cash_movements_bu_date ON cash_movements(business_unit_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_cash_movements_active ON cash_movements(is_active);
CREATE INDEX IF NOT EXISTS idx_cash_movements_bu_seq ON cash_movements(business_unit_id, sequence_number DESC);
CREATE INDEX IF NOT EXISTS idx_partner_accounts_partner ON partner_accounts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_account ON partner_account_transactions(partner_account_id);
CREATE INDEX IF NOT EXISTS idx_business_units_active ON business_units(is_active);
CREATE INDEX IF NOT EXISTS idx_movement_categories_type ON movement_categories(type);

-- 9. Disable RLS for development
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE partner_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE movement_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE partner_account_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_config DISABLE ROW LEVEL SECURITY;

-- 10. Seed Data
INSERT INTO partners (code, name, alias, participation_percentage, role, is_managing_partner, is_active) VALUES
('p1', 'Administrador Principal', 'Admin', 50.00, 'Managing Partner', true, true),
('p2', 'Socio Operativo', 'Socio 2', 50.00, 'Partner', false, true);

INSERT INTO partner_accounts (partner_id, current_balance) VALUES
(1, 0),
(2, 0);

INSERT INTO business_units (code, name, color, display_order, is_active) VALUES
('bu1', 'MDCDIII', '#FF5733', 1, true),
('bu2', 'FugaZ', '#33FF57', 2, true),
('bu3', 'Diburger', '#2196F3', 3, true);

INSERT INTO movement_categories (code, name, type) VALUES
('SALES', 'Ventas', 'CR'),
('EXPENSES', 'Gastos Generales', 'DB'),
('WITHDRAWALS', 'Retiros', 'DB'),
('INVESTMENT', 'Inversión', 'DB'),
('REFUND', 'Reembolso', 'CR');

INSERT INTO app_config (key, value) VALUES
('chart_dynamic_zoom', 'true'),
('default_days_chart', '7'),
('default_mode', 'auto'),
('default_manager', '1');
('default_business', 'Negocio');

-- Show results
SELECT 'Tables created with numeric IDs:' as info;
SELECT 'partners' as table, COUNT(*) as count FROM partners
UNION ALL SELECT 'business_units', COUNT(*) FROM business_units
UNION ALL SELECT 'movement_categories', COUNT(*) FROM movement_categories
UNION ALL SELECT 'cash_movements', COUNT(*) FROM cash_movements;

SELECT '✅ Flash Report schema recreated with auto-increment IDs!' as message;
