import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        console.log('\n1. Testing connection with a simple query...');
        
        // Try to query business_units table
        const { data, error } = await supabase
            .from('business_units')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('Error querying business_units:', error.message);
            console.log('Table might not exist yet. Trying to create test table...');
            
            // Try to execute a simple SQL to check if we have permissions
            const { error: rpcError } = await supabase.rpc('version');
            if (rpcError) {
                console.log('RPC version failed:', rpcError.message);
                
                // Try a simpler test - just check auth
                const { data: authData, error: authError } = await supabase.auth.getSession();
                if (authError) {
                    console.log('Auth check failed:', authError.message);
                } else {
                    console.log('Auth check passed, session:', authData.session ? 'Yes' : 'No');
                }
            } else {
                console.log('RPC version succeeded - connection is working');
            }
        } else {
            console.log(`Success! Found ${data.length} business units`);
            console.log('Sample data:', data);
        }
        
        console.log('\n2. Testing insert capability...');
        // Try to insert a test record (will fail if RLS is enabled)
        const testId = 'test-' + Date.now();
        const { data: insertData, error: insertError } = await supabase
            .from('business_units')
            .insert({
                id: testId,
                name: 'Test Business Unit',
                color: '#FF0000',
                is_active: true,
                display_order: 999
            })
            .select();
        
        if (insertError) {
            console.log('Insert test failed (might be due to RLS or missing table):', insertError.message);
        } else {
            console.log('Insert test succeeded:', insertData);
            
            // Clean up
            const { error: deleteError } = await supabase
                .from('business_units')
                .delete()
                .eq('id', testId);
            
            if (deleteError) {
                console.log('Cleanup failed:', deleteError.message);
            } else {
                console.log('Test record cleaned up');
            }
        }
        
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();