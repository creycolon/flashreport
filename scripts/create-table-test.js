import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing service role key for table creation...');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTableCreation() {
    try {
        console.log('1. Testing service role key permissions...');
        
        // Decode JWT to verify role
        const decoded = JSON.parse(Buffer.from(supabaseServiceKey.split('.')[1], 'base64').toString());
        console.log('JWT role:', decoded.role);
        
        // Try to create a test table using RPC exec_sql (if exists)
        console.log('\n2. Trying to create test table via RPC...');
        
        // First check if exec_sql function exists
        const { error: rpcCheckError } = await supabase.rpc('exec_sql', { 
            sql: 'SELECT 1 as test' 
        });
        
        if (rpcCheckError && rpcCheckError.code === '42883') {
            console.log('exec_sql function does not exist. Creating it...');
            
            // Try to create the exec_sql function (requires superuser privileges)
            // This SQL creates a function that executes arbitrary SQL
            const createFunctionSQL = `
                CREATE OR REPLACE FUNCTION exec_sql(sql text)
                RETURNS void
                LANGUAGE plpgsql
                SECURITY DEFINER
                AS $$
                BEGIN
                    EXECUTE sql;
                END;
                $$;
            `;
            
            // Can't create function via REST API either
            console.log('Cannot create exec_sql function via REST API.');
            console.log('Alternative: Use Supabase dashboard SQL editor or enable pg_net extension.');
        } else if (rpcCheckError) {
            console.log('RPC exec_sql error:', rpcCheckError.message);
        } else {
            console.log('exec_sql function exists!');
        }
        
        // Try to create table via direct REST API (won't work for DDL)
        console.log('\n3. Trying direct table creation via insert (should fail)...');
        
        // This will fail because you can't CREATE TABLE via REST API
        const testTableSQL = 'CREATE TABLE IF NOT EXISTS test_migration (id TEXT PRIMARY KEY, name TEXT)';
        
        // Try using fetch with SQL API
        console.log('\n4. Trying SQL API via fetch...');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ query: testTableSQL })
        });
        
        console.log('SQL API response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('SQL API error:', errorText.substring(0, 200));
        }
        
        console.log('\n5. Checking current tables...');
        
        // Query pg_catalog to see existing tables
        const { data: tables, error: tablesError } = await supabase
            .from('pg_catalog.pg_tables')
            .select('tablename')
            .eq('schemaname', 'public')
            .limit(10);
        
        if (tablesError) {
            console.log('Cannot query pg_catalog:', tablesError.message);
            
            // Try to query information_schema
            const { data: infoTables, error: infoError } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public')
                .limit(10);
            
            if (infoError) {
                console.log('Cannot query information_schema:', infoError.message);
            } else {
                console.log('Existing tables:', infoTables.map(t => t.table_name).join(', '));
            }
        } else {
            console.log('Existing tables:', tables.map(t => t.tablename).join(', '));
        }
        
    } catch (err) {
        console.error('Test failed:', err.message);
    }
    
    console.log('\n✅ Test completed.');
    console.log('\nRecommendation: Run migration SQL manually in Supabase dashboard SQL editor.');
    console.log('File: supabase/migrations/2025021702_complete_schema.sql');
}

testTableCreation();