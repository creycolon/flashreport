import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verifying Supabase connection and tables...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? '✓ Provided' : '✗ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyConnection() {
    try {
        console.log('\n1. Testing connection with anon key...');
        
        // Test 1: Simple query to business_units
        const { data: businessUnits, error: buError } = await supabase
            .from('business_units')
            .select('*')
            .limit(5);
        
        if (buError) {
            console.log('❌ Error querying business_units:', buError.message);
            console.log('Error code:', buError.code);
            
            if (buError.code === '42P01') {
                console.log('💡 Table does not exist. Run migration SQL in Supabase dashboard.');
            } else if (buError.code === '42501') {
                console.log('💡 Permission denied. Check RLS policies.');
            }
            return false;
        }
        
        console.log(`✅ business_units table exists: ${businessUnits.length} rows`);
        if (businessUnits.length > 0) {
            console.log('Sample:', businessUnits.map(bu => bu.name).join(', '));
        }
        
        // Test 2: Check other tables
        const tables = ['partners', 'movement_categories', 'cash_movements', 'partner_accounts', 'app_config'];
        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);
            
            if (error) {
                console.log(`❌ ${table}: ${error.code} - ${error.message}`);
            } else {
                console.log(`✅ ${table}: ${data?.length || 0} rows`);
            }
        }
        
        // Test 3: Try to insert a test record (if RLS allows)
        console.log('\n2. Testing write permissions...');
        const testId = 'test-' + Date.now();
        const { data: insertData, error: insertError } = await supabase
            .from('business_units')
            .insert({
                id: testId,
                name: 'Test Connection',
                color: '#FF0000',
                is_active: true,
                display_order: 999
            })
            .select();
        
        if (insertError) {
            console.log('⚠️ Insert test failed (might be due to RLS):', insertError.message);
        } else {
            console.log('✅ Insert test succeeded:', insertData[0]?.name);
            
            // Clean up
            const { error: deleteError } = await supabase
                .from('business_units')
                .delete()
                .eq('id', testId);
            
            if (deleteError) {
                console.log('⚠️ Cleanup failed:', deleteError.message);
            } else {
                console.log('✅ Test record cleaned up');
            }
        }
        
        // Test 4: Verify repository functions work
        console.log('\n3. Testing repository functions...');
        try {
            // Import repositories directly
            const { businessUnitRepository } = await import('../src/infrastructure/repositories/businessUnitRepository.js');
            const units = await businessUnitRepository.getAll();
            console.log(`✅ businessUnitRepository.getAll(): ${units.length} units`);
            
            if (units.length > 0) {
                const { categoryRepository } = await import('../src/infrastructure/repositories/categoryRepository.js');
                const categories = await categoryRepository.getAll();
                console.log(`✅ categoryRepository.getAll(): ${categories.length} categories`);
            }
        } catch (repoError) {
            console.log('⚠️ Repository test failed:', repoError.message);
            console.log('Stack:', repoError.stack);
        }
        
        console.log('\n🎉 Connection verification complete!');
        console.log('\n✅ The app should connect successfully with npx expo start.');
        console.log('📱 Make sure environment variables are loaded in Expo:');
        console.log('   - EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local');
        console.log('   - app.config.js passes them to Constants.extra');
        
        return true;
        
    } catch (err) {
        console.error('❌ Verification failed:', err);
        return false;
    }
}

verifyConnection().then(success => {
    process.exit(success ? 0 : 1);
});