-- Ensure points of sale exist for all business units
INSERT INTO points_of_sale (business_unit_id, name, fiscal_id)
SELECT id, name || ' - POS Principal', 'Default'
FROM business_units
WHERE NOT EXISTS (
    SELECT 1 FROM points_of_sale WHERE points_of_sale.business_unit_id = business_units.id
);

-- Verify points of sale
SELECT 
    bu.id as business_unit_id,
    bu.name as business_unit_name,
    pos.id as pos_id,
    pos.name as pos_name
FROM business_units bu
LEFT JOIN points_of_sale pos ON bu.id = pos.business_unit_id
ORDER BY bu.name;
