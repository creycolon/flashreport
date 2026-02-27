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

async function checkBrokenRelations() {
    console.log('🔍 Verificando relaciones rotas en movimientos\n');
    
    // 1. Movimientos activos sin categoría válida
    console.log('1. Movimientos activos sin categoría válida:');
    const { data: movementsWithoutCategory, error: catRelError } = await supabase
        .from('cash_movements')
        .select('id, business_unit_id, category_id, transaction_date')
        .eq('is_active', true)
        .is('category_id', null);
    
    if (catRelError) {
        console.error('❌ Error:', catRelError);
    } else {
        console.log(`   Encontrados: ${movementsWithoutCategory.length} movimientos con category_id NULL`);
        movementsWithoutCategory.forEach(mov => {
            console.log(`   - ${mov.id} | BU: ${mov.business_unit_id} | Fecha: ${mov.transaction_date}`);
        });
    }
    
    // 2. Movimientos activos con category_id que no existe en movement_categories
    console.log('\n2. Movimientos activos con category_id inexistente:');
    // Primero obtener todos los category_ids válidos
    const { data: validCategories, error: catError } = await supabase
        .from('movement_categories')
        .select('id');
    
    if (catError) {
        console.error('❌ Error obteniendo categorías:', catError);
    } else {
        const validCategoryIds = validCategories.map(c => c.id);
        
        // Obtener todos los movimientos activos
        const { data: allActiveMovements, error: movError } = await supabase
            .from('cash_movements')
            .select('id, business_unit_id, category_id, transaction_date')
            .eq('is_active', true);
        
        if (movError) {
            console.error('❌ Error obteniendo movimientos:', movError);
        } else {
            const brokenCategoryMovements = allActiveMovements.filter(mov => 
                mov.category_id && !validCategoryIds.includes(mov.category_id)
            );
            
            console.log(`   Encontrados: ${brokenCategoryMovements.length} movimientos con category_id inválido`);
            brokenCategoryMovements.forEach(mov => {
                console.log(`   - ${mov.id} | BU: ${mov.business_unit_id} | Categoría: ${mov.category_id} | Fecha: ${mov.transaction_date}`);
            });
        }
    }
    
    // 3. Movimientos activos sin business_unit válido
    console.log('\n3. Movimientos activos sin business_unit válido:');
    const { data: movementsWithoutBU, error: buNullError } = await supabase
        .from('cash_movements')
        .select('id, business_unit_id, category_id, transaction_date')
        .eq('is_active', true)
        .is('business_unit_id', null);
    
    if (buNullError) {
        console.error('❌ Error:', buNullError);
    } else {
        console.log(`   Encontrados: ${movementsWithoutBU.length} movimientos con business_unit_id NULL`);
        movementsWithoutBU.forEach(mov => {
            console.log(`   - ${mov.id} | Categoría: ${mov.category_id} | Fecha: ${mov.transaction_date}`);
        });
    }
    
    // 4. Movimientos activos con business_unit_id que no existe
    console.log('\n4. Movimientos activos con business_unit_id inexistente:');
    const { data: validBusinessUnits, error: buError } = await supabase
        .from('business_units')
        .select('id');
    
    if (buError) {
        console.error('❌ Error obteniendo business units:', buError);
    } else {
        const validBUIds = validBusinessUnits.map(bu => bu.id);
        
        const { data: allActiveMovements2, error: movError2 } = await supabase
            .from('cash_movements')
            .select('id, business_unit_id, category_id, transaction_date')
            .eq('is_active', true);
        
        if (movError2) {
            console.error('❌ Error obteniendo movimientos:', movError2);
        } else {
            const brokenBUMovements = allActiveMovements2.filter(mov => 
                mov.business_unit_id && !validBUIds.includes(mov.business_unit_id)
            );
            
            console.log(`   Encontrados: ${brokenBUMovements.length} movimientos con business_unit_id inválido`);
            brokenBUMovements.forEach(mov => {
                console.log(`   - ${mov.id} | BU: ${mov.business_unit_id} | Categoría: ${mov.category_id} | Fecha: ${mov.transaction_date}`);
            });
        }
    }
    
    // 5. Verificar movimientos inactivos recientes
    console.log('\n5. Movimientos inactivos recientes (últimos 7 días):');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: recentInactive, error: inactiveError } = await supabase
        .from('cash_movements')
        .select('id, business_unit_id, transaction_date, is_active, closed_period')
        .eq('is_active', false)
        .gte('transaction_date', weekAgo.toISOString())
        .order('transaction_date', { ascending: false })
        .limit(20);
    
    if (inactiveError) {
        console.error('❌ Error:', inactiveError);
    } else {
        console.log(`   Encontrados: ${recentInactive.length} movimientos inactivos recientes`);
        if (recentInactive.length > 0) {
            console.log('   Posible causa: algún proceso está desactivando movimientos');
            recentInactive.forEach(mov => {
                console.log(`   - ${mov.id} | BU: ${mov.business_unit_id} | ${mov.transaction_date} | closed_period: ${mov.closed_period || 'N/A'}`);
            });
        }
    }
    
    console.log('\n🔧 Soluciones posibles:');
    console.log('1. Si hay movimientos con relaciones rotas:');
    console.log('   - Revisar la lógica de creación de movimientos');
    console.log('   - Asegurar que category_id y business_unit_id sean válidos');
    console.log('2. Si hay muchos movimientos inactivos:');
    console.log('   - Revisar si closeAccountingPeriod se ejecuta accidentalmente');
    console.log('   - Verificar que is_active se mantenga true');
    console.log('3. Si el inner join filtra muchos movimientos:');
    console.log('   - Cambiar !inner por left join en los repositorios');
    console.log('   - O corregir los datos inconsistentes');
}

checkBrokenRelations().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});