-- 1. Partners
CREATE TABLE partners (
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
CREATE TABLE partner_accounts (
    id TEXT PRIMARY KEY,
    partner_id TEXT REFERENCES partners(id) ON DELETE CASCADE,
    current_balance DECIMAL(12,2) DEFAULT 0,
    negative_balance_flag BOOLEAN DEFAULT false,
    negative_balance_since TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Business Units
CREATE TABLE business_units (
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
CREATE TABLE movement_categories (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('CR','DB','BOTH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 5. Cash Movements (CORE TABLE)
CREATE TABLE cash_movements (
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
CREATE TABLE partner_account_transactions (
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
CREATE TABLE app_config (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 8. Índices para performance
CREATE INDEX idx_cash_movements_bu_date ON cash_movements(business_unit_id, transaction_date DESC);
CREATE INDEX idx_cash_movements_active ON cash_movements(is_active);
CREATE INDEX idx_partner_accounts_partner ON partner_accounts(partner_id);
CREATE INDEX idx_partner_transactions_account ON partner_account_transactions(partner_account_id);
3.2 Configurar Row Level Security (RLS)
-- Habilitar RLS en todas las tablas
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;
-- ... repetir para todas las tablas
-- Política para lectura pública (ajustar según necesidades)
CREATE POLICY "Permitir lectura anónima" ON business_units
    FOR SELECT USING (true);
CREATE POLICY "Permitir inserción autenticada" ON cash_movements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');