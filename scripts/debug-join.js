import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugJoin() {
    console.log('🔍 Debug de inner join vs movimientos activos\n');
    
    // Obtener todos los movimientos activos
    const { data: allActive, error: activeError } = await supabase
        .from('cash_movements')
        .select('id, business_unit_id, category_id, transaction_date, type, amount, is_active')
        .eq('is_active', true)
        .order('transaction_date', { ascending: false });
    
    if (activeError) {
        console.error('Error:', activeError);
        return;
    }
    
    console.log(`Total movimientos activos: ${allActive.length}`);
    
    // Obtener movimientos con inner join (como la app)
    const { data: withJoin, error: joinError } = await supabase
        .from('cash_movements')
        .select(`
            id,
            business_unit_id,
            category_id,
            transaction_date,
            type,
            amount,
            movement_categories!inner(id, name),
            business_units!inner(id, name)
        `)
        .eq('is_active', true)
        .order('transaction_date', { ascending: false });
    
    if (joinError) {
        console.error('Error join:', joinError);
    } else {
        console.log(`Movimientos con join exitoso: ${withJoin.length}`);
    }
    
    // Identificar cuáles movimientos activos no están en el join
    const joinedIds = new Set(withJoin?.map(m => m.id) || []);
    const missingInJoin = allActive.filter(m => !joinedIds.has(m.id));
    
    console.log(`\nMovimientos activos que NO aparecen en el join: ${missingInJoin.length}`);
    
    if (missingInJoin.length > 0) {
        console.log('\nDetalles de movimientos faltantes:');
        missingInJoin.forEach((mov, i) => {
            console.log(`${i+1}. ${mov.id}`);
            console.log(`   BU: ${mov.business_unit_id}, Categoría: ${mov.category_id}`);
            console.log(`   Fecha: ${mov.transaction_date}, Tipo: ${mov.type}, Monto: ${mov.amount}`);
            
            // Verificar si category_id existe
            supabase
                .from('movement_categories')
                .select('id')
                .eq('id', mov.category_id)
                .then(({ data: cat, error: catErr }) => {
                    if (catErr) console.log(`   Error verificando categoría: ${catErr.message}`);
                    else console.log(`   Categoría existe en DB: ${cat.length > 0 ? 'Sí' : 'No'}`);
                });
            
            // Verificar si business_unit_id existe
            supabase
                .from('business_units')
                .select('id')
                .eq('id', mov.business_unit_id)
                .then(({ data: bu, error: buErr }) => {
                    if (buErr) console.log(`   Error verificando BU: ${buErr.message}`);
                    else console.log(`   BU existe en DB: ${bu.length > 0 ? 'Sí' : 'No'}`);
                });
        });
        
        // Esperar un momento para las promesas
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Probar con left join en lugar de inner join
    console.log('\n🔧 Probando con LEFT join (debería mostrar todos los activos):');
    const { data: withLeftJoin, error: leftError } = await supabase
        .from('cash_movements')
        .select(`
            id,
            business_unit_id,
            category_id,
            transaction_date,
            movement_categories(name),
            business_units(name)
        `)
        .eq('is_active', true)
        .order('transaction_date', { ascending: false })
        .limit(10);
    
    if (leftError) {
        console.error('Error left join:', leftError);
    } else {
        console.log(`Movimientos con LEFT join: ${withLeftJoin.length}`);
        console.log('Esto debería coincidir con el total de activos.');
    }
    
    console.log('\n🎯 Conclusión:');
    if (missingInJoin.length > 0) {
        console.log('El inner join está filtrando movimientos porque alguna relación falla.');
        console.log('Posibles causas:');
        console.log('1. category_id o business_unit_id no existen en sus tablas');
        console.log('2. Hay un problema de permisos RLS (pero RLS está deshabilitado)');
        console.log('3. La sintaxis !inner no funciona como se espera');
        console.log('\nSolución temporal: Cambiar !inner por left join en los repositorios.');
    } else {
        console.log('No se encontraron discrepancias. El problema puede estar en otro lugar.');
    }
}

debugJoin().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});