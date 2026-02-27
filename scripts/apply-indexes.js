import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

// Extract project ref from URL
const urlMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
if (!urlMatch) {
    console.error('Invalid Supabase URL format');
    process.exit(1);
}
const projectRef = urlMatch[1];
console.log('Project ref:', projectRef);

// Read SQL file
const sqlFile = join(__dirname, '..', 'supabase', 'migrations', '2025021703_performance_indexes.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');
console.log('SQL to execute:', sql.length, 'chars');

// Use Supabase management API
async function applyIndexes() {
    try {
        console.log('🚀 Applying performance indexes via Supabase API...');
        
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: sql,
                // Optional: set a flag to run as superuser
                // role: 'postgres'
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            
            // Try alternative: use supabase.rpc if exec_sql exists
            console.log('\nTrying alternative method via RPC...');
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            
            // Split SQL into statements
            const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
            
            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i].trim();
                console.log(`Executing statement ${i + 1}/${statements.length}: ${stmt.substring(0, 80)}...`);
                
                try {
                    const { error } = await supabase.rpc('exec_sql', { sql: stmt });
                    if (error) {
                        console.log(`Statement ${i + 1} failed:`, error.message);
                        console.log('You may need to execute SQL manually in Supabase dashboard.');
                        break;
                    } else {
                        console.log(`Statement ${i + 1} succeeded.`);
                    }
                } catch (err) {
                    console.log(`Statement ${i + 1} error:`, err.message);
                }
            }
            
            console.log('\n📋 If automatic execution failed, please run this SQL manually in Supabase dashboard SQL Editor:');
            console.log('\n' + sql);
            return;
        }
        
        const result = await response.json();
        console.log('✅ Indexes applied successfully!');
        console.log('Result:', result);
        
    } catch (err) {
        console.error('Failed to apply indexes:', err);
        console.log('\n📋 Please run this SQL manually in Supabase dashboard SQL Editor:');
        console.log('\n' + sql);
    }
}

applyIndexes();