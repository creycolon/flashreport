-- Flash Report - Complete Schema for Supabase PostgreSQL
-- Run this SQL in Supabase Dashboard SQL Editor

-- 1. Partners
CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS partner_accounts (
    id TEXT PRIMARY KEY,
    partner_id TEXT REFERENCES partners(id) ON DELETE CASCADE,
    current_balance DECIMAL(12,2) DEFAULT 0,
    negative_balance_flag BOOLEAN DEFAULT false,
    negative_balance_since TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Business Units
CREATE TABLE IF NOT EXISTS business_units (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    color TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Movement Categories
CREATE TABLE IF NOT EXISTS movement_categories (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('CR','DB','BOTH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Cash Movements (CORE TABLE)
CREATE TABLE IF NOT EXISTS cash_movements (
    id TEXT PRIMARY KEY,
    business_unit_id TEXT REFERENCES business_units(id) ON DELETE CASCADE,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT CHECK (type IN ('CR','DB')),
    category_id TEXT REFERENCES movement_categories(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    reference_id TEXT,
    partner_account_id TEXT REFERENCES partner_accounts(id) ON DELETE SET NULL,
    created_by TEXT REFERENCES partners(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    closed_period TEXT,
    sequence_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Partner Account Transactions
CREATE TABLE IF NOT EXISTS partner_account_transactions (
    id TEXT PRIMARY KEY,
    partner_account_id TEXT REFERENCES partner_accounts(id) ON DELETE CASCADE,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT CHECK (type IN ('DB','CR')),
    origin TEXT CHECK (origin IN ('WITHDRAWAL','DISTRIBUTION','SETTLEMENT_PAYMENT','EXPENSE_REIMBURSEMENT','ADJUSTMENT')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    reference_id TEXT,
    created_by TEXT REFERENCES partners(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. App Configuration
CREATE TABLE IF NOT EXISTS app_config (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cash_movements_bu_date ON cash_movements(business_unit_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_cash_movements_active ON cash_movements(is_active);
CREATE INDEX IF NOT EXISTS idx_partner_accounts_partner ON partner_accounts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_transactions_account ON partner_account_transactions(partner_account_id);
CREATE INDEX IF NOT EXISTS idx_business_units_active ON business_units(is_active);
CREATE INDEX IF NOT EXISTS idx_movement_categories_type ON movement_categories(type);

-- 9. Disable RLS for initial development (enable later for production)
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE partner_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE movement_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE partner_account_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_config DISABLE ROW LEVEL SECURITY;

-- 10. Seed Data
-- Insert default partners
INSERT INTO partners (id, name, alias, participation_percentage, role, is_managing_partner, is_active) VALUES
('p1', 'Administrador Principal', 'Admin', 50.00, 'Managing Partner', true, true),
('p2', 'Socio Operativo', 'Socio 2', 50.00, 'Partner', false, true)
ON CONFLICT (id) DO NOTHING;

-- Insert partner accounts
INSERT INTO partner_accounts (id, partner_id, current_balance) VALUES
('acc_p1', 'p1', 0),
('acc_p2', 'p2', 0)
ON CONFLICT (id) DO NOTHING;

-- Insert default business units
INSERT INTO business_units (id, name, color, display_order, is_active) VALUES
('bu1', 'MDCDIII', '#FF5733', 1, true),
('bu2', 'FugaZ', '#33FF57', 2, true),
('bu3', 'Diburger', '#2196F3', 3, true)
ON CONFLICT (id) DO NOTHING;

-- Insert movement categories
INSERT INTO movement_categories (id, code, name, type) VALUES
('cat1', 'SALES', 'Ventas', 'CR'),
('cat2', 'EXPENSES', 'Gastos Generales', 'DB'),
('cat3', 'WITHDRAWALS', 'Retiros', 'DB'),
('cat4', 'INVESTMENT', 'Inversión', 'DB'),
('cat5', 'REFUND', 'Reembolso', 'CR')
ON CONFLICT (id) DO NOTHING;

-- Insert app config
INSERT INTO app_config (id, key, value) VALUES
('cfg1', 'chart_dynamic_zoom', 'true'),
('cfg2', 'default_days_chart', '7')
ON CONFLICT (id) DO NOTHING;

-- 11. Success message
SELECT '✅ Flash Report database schema created successfully!' as message;
