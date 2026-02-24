-- 1. Create Points of Sale table
CREATE TABLE IF NOT EXISTS points_of_sale (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_unit_id BIGINT REFERENCES business_units(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    fiscal_id TEXT DEFAULT 'Identificacion Fiscal',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add point_of_sale_id to cash_movements
ALTER TABLE cash_movements 
ADD COLUMN IF NOT EXISTS point_of_sale_id BIGINT REFERENCES points_of_sale(id) ON DELETE SET NULL;

-- 3. Seed initial POS for each business unit
INSERT INTO points_of_sale (business_unit_id, name, fiscal_id)
SELECT id, name || ' POS 1', 'Identificacion Fiscal'
FROM business_units
WHERE NOT EXISTS (
    SELECT 1 FROM points_of_sale WHERE points_of_sale.business_unit_id = business_units.id
);

-- 4. Disable RLS for development
ALTER TABLE points_of_sale DISABLE ROW LEVEL SECURITY;
