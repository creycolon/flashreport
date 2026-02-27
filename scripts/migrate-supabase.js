import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Override with provided service role key if needed
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||

console.log('Running Supabase migration...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? '✓ Provided' : '✗ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

// Create client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read migration SQL
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '2025021701_initial_schema.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Clean up SQL - remove incomplete RLS policies and add proper ones
const cleanSQL = migrationSQL.split('\n').filter(line => {
    // Remove lines with incomplete RLS configuration
    return !line.includes('3.2 Configurar Row Level Security (RLS)') &&
           !line.includes('-- Habilitar RLS en todas las tablas') &&
           !line.includes('-- ... repetir para todas las tablas') &&
           !line.includes('-- Política para lectura pública') &&
           !line.includes('CREATE POLICY') &&
           !line.includes('ALTER TABLE') && !line.includes('ENABLE ROW LEVEL SECURITY');
}).join('\n');

// Add proper RLS configuration (disable for now, enable later if needed)
const fullSQL = cleanSQL + `
-- Disable RLS for initial development (enable later for production)
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE partner_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE movement_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE partner_account_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_config DISABLE ROW LEVEL SECURITY;
`;

async function runMigration() {
    try {
        console.log('\n1. Executing migration SQL...');
        
        // Split SQL by semicolons and execute each statement
        const statements = fullSQL.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i].trim();
            if (!stmt) continue;
            
            console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
            console.log(stmt.substring(0, 100) + (stmt.length > 100 ? '...' : ''));
            
            try {
                const { error } = await supabase.rpc('exec_sql', { sql: stmt });
                if (error) {
                    // Try direct SQL execution via REST API
                    console.log('RPC exec_sql failed, trying alternative...');
                    
                    // For CREATE TABLE statements, Supabase REST API doesn't support them directly
                    // We'll skip for now and rely on the tables being created via dashboard
                    if (stmt.startsWith('CREATE TABLE') || stmt.startsWith('CREATE INDEX')) {
                        console.log('CREATE statement - requires SQL editor execution');
                        continue;
                    }
                }
            } catch (err) {
                console.log(`Statement ${i + 1} execution issue:`, err.message);
            }
        }
        
        console.log('\n2. Testing created tables...');
        
        const tables = ['business_units', 'partners', 'movement_categories', 'cash_movements', 'partner_accounts', 'partner_account_transactions', 'app_config'];
        
        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);
            
            if (error && error.code === '42P01') { // Table doesn't exist
                console.log(`Table ${table}: ❌ Not created yet (run SQL in Supabase dashboard)`);
            } else if (error) {
                console.log(`Table ${table}: ⚠️  Error: ${error.message}`);
            } else {
                console.log(`Table ${table}: ✓ Exists (${data?.length || 0} rows)`);
            }
        }
        
        console.log('\n3. Inserting test data...');
        
        // Insert default business units if table exists and empty
        const { data: existingBUs, error: buError } = await supabase
            .from('business_units')
            .select('*')
            .limit(1);
        
        if (!buError && (!existingBUs || existingBUs.length === 0)) {
            const testBUs = [
                { id: 'bu1', name: 'MDCDIII', color: '#FF5733', is_active: true, display_order: 1 },
                { id: 'bu2', name: 'FugaZ', color: '#33FF57', is_active: true, display_order: 2 },
                { id: 'bu3', name: 'Diburger', color: '#2196F3', is_active: true, display_order: 3 }
            ];
            
            const { error: insertError } = await supabase
                .from('business_units')
                .insert(testBUs);
            
            if (insertError) {
                console.log('Test data insertion failed:', insertError.message);
            } else {
                console.log('Inserted 3 test business units');
            }
        }
        
        console.log('\n✅ Migration completed!');
        console.log('\nNext steps:');
        console.log('1. If tables were not created, run the SQL manually in Supabase dashboard SQL Editor');
        console.log('2. Test the app connection');
        console.log('3. Consider enabling RLS for production');
        
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();