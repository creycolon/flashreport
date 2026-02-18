import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

// Create client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkIndexes() {
    try {
        console.log('🔍 Checking existing indexes...\n');
        
        // Query pg_indexes for our tables
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
                SELECT 
                    tablename,
                    indexname,
                    indexdef
                FROM pg_indexes 
                WHERE schemaname = 'public' 
                ORDER BY tablename, indexname;
            `
        });
        
        if (error) {
            // Alternative query using direct SQL via REST (not supported)
            console.log('Cannot query pg_indexes via RPC, using alternative method...');
            console.log('Please run this SQL in Supabase dashboard SQL Editor:\n');
            console.log(`
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
            `);
            return;
        }
        
        console.log('Existing indexes:');
        console.log('=================');
        
        const tables = {};
        data.forEach(row => {
            if (!tables[row.tablename]) tables[row.tablename] = [];
            tables[row.tablename].push(row);
        });
        
        Object.keys(tables).sort().forEach(table => {
            console.log(`\n${table}:`);
            tables[table].forEach(idx => {
                console.log(`  ${idx.indexname}`);
                console.log(`    ${idx.indexdef}`);
            });
        });
        
        // Check for missing recommended indexes
        console.log('\n\n🔍 Recommended indexes check:');
        console.log('============================');
        
        const recommendedIndexes = [
            { table: 'cash_movements', name: 'idx_cash_movements_date', columns: 'transaction_date DESC' },
            { table: 'cash_movements', name: 'idx_cash_movements_active_date', columns: 'is_active, transaction_date DESC' },
            { table: 'cash_movements', name: 'idx_cash_movements_category_date', columns: 'category_id, transaction_date DESC' },
            { table: 'cash_movements', name: 'idx_cash_movements_bu_active_date', columns: 'business_unit_id, is_active, transaction_date DESC' },
            { table: 'partner_account_transactions', name: 'idx_partner_transactions_date', columns: 'transaction_date DESC' },
            { table: 'business_units', name: 'idx_business_units_order', columns: 'display_order, is_active' },
            { table: 'cash_movements', name: 'idx_cash_movements_type_date', columns: 'type, transaction_date DESC' }
        ];
        
        const existingIndexNames = data.map(row => row.indexname);
        let missingCount = 0;
        
        recommendedIndexes.forEach(idx => {
            if (existingIndexNames.includes(idx.name)) {
                console.log(`✅ ${idx.name} - exists`);
            } else {
                console.log(`❌ ${idx.name} - missing (CREATE INDEX ${idx.name} ON ${idx.table}(${idx.columns}))`);
                missingCount++;
            }
        });
        
        if (missingCount > 0) {
            console.log(`\n📋 ${missingCount} recommended indexes missing.`);
            console.log('\nTo create missing indexes, run this SQL in Supabase dashboard SQL Editor:');
            console.log('\n' + recommendedIndexes
                .filter(idx => !existingIndexNames.includes(idx.name))
                .map(idx => `CREATE INDEX ${idx.name} ON ${idx.table}(${idx.columns});`)
                .join('\n'));
        } else {
            console.log('\n🎉 All recommended indexes exist!');
        }
        
    } catch (err) {
        console.error('Error checking indexes:', err);
    }
}

checkIndexes();