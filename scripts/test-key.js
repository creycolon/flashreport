import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjyjavwuguzmwxofdxsr.supabase.co';
const testKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qeWphdnd1Z3V6bXd4b2ZkeHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDc0NjcsImV4cCI6MjA4NjkyMzQ2N30.MJ5N489w7bTu_JRRTN2phoQIEQDsWLwPBnpuFUqA3GU';

console.log('Testing provided key...');
console.log('URL:', supabaseUrl);
console.log('Key (first 50 chars):', testKey.substring(0, 50) + '...');

// Decode JWT to check role
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

const decoded = parseJwt(testKey);
console.log('\nDecoded JWT:', decoded ? JSON.stringify(decoded, null, 2) : 'Invalid JWT');

const supabase = createClient(supabaseUrl, testKey);

async function testKeyPermissions() {
    try {
        console.log('\n1. Testing connection with key...');
        
        // Try to get session info
        const { data: authData, error: authError } = await supabase.auth.getSession();
        console.log('Auth session:', authError ? `Error: ${authError.message}` : (authData.session ? 'Has session' : 'No session'));
        
        // Try to query (will fail if tables don't exist)
        const { data, error } = await supabase
            .from('business_units')
            .select('*')
            .limit(1);
        
        if (error) {
            console.log('Table query error:', error.message);
            console.log('Error code:', error.code);
            
            if (error.code === '42501') {
                console.log('❌ Permission denied - this is likely an anon key without RLS bypass');
            } else if (error.code === '42P01') {
                console.log('✅ Table doesn\'t exist (expected), but key can connect');
            } else {
                console.log('⚠️  Other error - key might be working');
            }
        } else {
            console.log('✅ Key can query data:', data);
        }
        
        // Try to create a table via RPC (requires service role)
        console.log('\n2. Testing admin privileges...');
        const { error: rpcError } = await supabase.rpc('version');
        if (rpcError) {
            console.log('RPC version error:', rpcError.message);
        } else {
            console.log('✅ RPC works');
        }
        
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testKeyPermissions();