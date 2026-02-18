-- Flash Report - Performance Indexes
-- Add indexes to improve query performance

-- 1. Index for date-only filtering (used in listAll, getGlobalBalance, etc.)
CREATE INDEX IF NOT EXISTS idx_cash_movements_date ON cash_movements(transaction_date DESC);

-- 2. Composite index for active movements sorted by date (common query pattern)
CREATE INDEX IF NOT EXISTS idx_cash_movements_active_date ON cash_movements(is_active, transaction_date DESC);

-- 3. Index for category type queries with date filtering
CREATE INDEX IF NOT EXISTS idx_cash_movements_category_date ON cash_movements(category_id, transaction_date DESC);

-- 4. Index for business unit balance queries (already have idx_cash_movements_bu_date but add with is_active)
CREATE INDEX IF NOT EXISTS idx_cash_movements_bu_active_date ON cash_movements(business_unit_id, is_active, transaction_date DESC);

-- 5. Index for partner account transactions by date
CREATE INDEX IF NOT EXISTS idx_partner_transactions_date ON partner_account_transactions(transaction_date DESC);

-- 6. Index for business units by display order (for sorting)
CREATE INDEX IF NOT EXISTS idx_business_units_order ON business_units(display_order, is_active);

-- 7. Index for cash movements type+date (for credit/debit aggregations)
CREATE INDEX IF NOT EXISTS idx_cash_movements_type_date ON cash_movements(type, transaction_date DESC);

-- 8. Index optimized for daily sales queries (business_unit_id, type, is_active, transaction_date)
CREATE INDEX IF NOT EXISTS idx_cash_movements_bu_type_active_date ON cash_movements(business_unit_id, type, is_active, transaction_date DESC);

-- Success message
SELECT '✅ Performance indexes created successfully!' as message;