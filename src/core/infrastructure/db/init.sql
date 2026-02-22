-- Flash Report - Database Schema (SQLite)

-- 1. Partners
CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    alias TEXT,
    participation_percentage REAL NOT NULL,
    role TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    is_managing_partner INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. Partner Accounts
CREATE TABLE IF NOT EXISTS partner_accounts (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL,
    current_balance REAL DEFAULT 0,
    negative_balance_flag INTEGER CHECK (negative_balance_flag IN (0,1)) DEFAULT 0,
    negative_balance_since TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- 3. Partner Account Transactions
CREATE TABLE IF NOT EXISTS partner_account_transactions (
    id TEXT PRIMARY KEY,
    partner_account_id TEXT NOT NULL,
    transaction_date TEXT NOT NULL,
    type TEXT CHECK (type IN ('DB','CR')),
    origin TEXT CHECK (origin IN ('WITHDRAWAL','DISTRIBUTION','SETTLEMENT_PAYMENT','EXPENSE_REIMBURSEMENT','ADJUSTMENT')),
    amount REAL NOT NULL,
    description TEXT,
    reference_id TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_account_id) REFERENCES partner_accounts(id),
    FOREIGN KEY (created_by) REFERENCES partners(id)
);

-- 4. Business Units (Restaurantes/Sucursales)
CREATE TABLE IF NOT EXISTS business_units (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    color TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. Movement Categories
CREATE TABLE IF NOT EXISTS movement_categories (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('CR','DB','BOTH')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5b. Points of Sale
CREATE TABLE IF NOT EXISTS points_of_sale (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_unit_id TEXT NOT NULL,
    name TEXT NOT NULL,
    fiscal_id TEXT DEFAULT 'Identificacion Fiscal',
    is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_unit_id) REFERENCES business_units(id)
);

-- 6. Cash Movements
CREATE TABLE IF NOT EXISTS cash_movements (
    id TEXT PRIMARY KEY,
    business_unit_id TEXT NOT NULL,
    transaction_date TEXT NOT NULL,
    type TEXT CHECK (type IN ('CR','DB')),
    category_id TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    reference_id TEXT,
    partner_account_id TEXT,
    created_by TEXT,
    point_of_sale_id INTEGER,
    is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
    closed_period TEXT,
    sequence_number INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_unit_id) REFERENCES business_units(id),
    FOREIGN KEY (category_id) REFERENCES movement_categories(id),
    FOREIGN KEY (partner_account_id) REFERENCES partner_accounts(id),
    FOREIGN KEY (created_by) REFERENCES partners(id),
    FOREIGN KEY (point_of_sale_id) REFERENCES points_of_sale(id)
);

-- 7. App Configuration
CREATE TABLE IF NOT EXISTS app_config (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partner_accounts_partner_id ON partner_accounts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_account_transactions_account_id ON partner_account_transactions(partner_account_id);
CREATE INDEX IF NOT EXISTS idx_business_units_active ON business_units(is_active);
CREATE INDEX IF NOT EXISTS idx_cash_movements_bu_active ON cash_movements(business_unit_id, is_active);
CREATE INDEX IF NOT EXISTS idx_cash_movements_sequence ON cash_movements(business_unit_id, sequence_number DESC);
CREATE INDEX IF NOT EXISTS idx_cash_movements_date ON cash_movements(transaction_date);
