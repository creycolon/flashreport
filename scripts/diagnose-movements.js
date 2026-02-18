import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
    console.log('🔍 Diagnóstico de Movimientos en Supabase\n');
    
    // 1. Verificar conexión y contar movimientos totales
    console.log('1. Conteo total de movimientos:');
    const { count, error: countError } = await supabase
        .from('cash_movements')
        .select('*', { count: 'exact', head: true });
    
    if (countError) {
        console.error('❌ Error contando movimientos:', countError);
    } else {
        console.log(`   Total: ${count} movimientos en la tabla cash_movements`);
    }
    
    // 2. Verificar movimientos activos
    console.log('\n2. Movimientos activos (is_active = true):');
    const { data: activeMovements, error: activeError } = await supabase
        .from('cash_movements')
        .select('id, business_unit_id, transaction_date, type, amount, is_active')
        .eq('is_active', true)
        .order('transaction_date', { ascending: false })
        .limit(10);
    
    if (activeError) {
        console.error('❌ Error obteniendo movimientos activos:', activeError);
    } else {
        console.log(`   Encontrados: ${activeMovements.length} movimientos activos`);
        if (activeMovements.length > 0) {
            console.log('   Últimos 10 movimientos activos:');
            activeMovements.forEach((mov, i) => {
                console.log(`   ${i+1}. ${mov.id} | BU: ${mov.business_unit_id} | ${mov.transaction_date} | ${mov.type} ${mov.amount} | active: ${mov.is_active}`);
            });
        } else {
            console.log('   ⚠️ No hay movimientos activos. Los movimientos nuevos se crean con is_active=true.');
        }
    }
    
    // 3. Verificar relaciones con categorías
    console.log('\n3. Verificando relaciones con categorías:');
    const { data: categories, error: catError } = await supabase
        .from('movement_categories')
        .select('*')
        .limit(5);
    
    if (catError) {
        console.error('❌ Error obteniendo categorías:', catError);
    } else {
        console.log(`   Categorías disponibles: ${categories.length}`);
        categories.forEach(cat => {
            console.log(`   - ${cat.id}: ${cat.name} (${cat.code}) tipo: ${cat.type}`);
        });
    }
    
    // 4. Verificar relaciones con business units
    console.log('\n4. Verificando relaciones con business units:');
    const { data: businessUnits, error: buError } = await supabase
        .from('business_units')
        .select('*')
        .limit(5);
    
    if (buError) {
        console.error('❌ Error obteniendo business units:', buError);
    } else {
        console.log(`   Business units disponibles: ${businessUnits.length}`);
        businessUnits.forEach(bu => {
            console.log(`   - ${bu.id}: ${bu.name} (active: ${bu.is_active})`);
        });
    }
    
    // 5. Probar consulta con inner join (como lo hace la app)
    console.log('\n5. Probando consulta con inner join (listAll):');
    const { data: joinedData, error: joinError } = await supabase
        .from('cash_movements')
        .select(`
            *,
            movement_categories!inner(name, code),
            business_units!inner(name, color)
        `)
        .eq('is_active', true)
        .order('transaction_date', { ascending: false })
        .limit(5);
    
    if (joinError) {
        console.error('❌ Error en consulta con inner join:', joinError);
        console.log('   Esto podría explicar por qué no se ven movimientos en la app.');
        console.log('   Posible causa: falta relación entre tablas.');
    } else {
        console.log(`   Consulta exitosa: ${joinedData.length} movimientos con joins`);
        if (joinedData.length > 0) {
            joinedData.forEach((mov, i) => {
                console.log(`   ${i+1}. ${mov.id} | ${mov.business_units?.name} | ${mov.movement_categories?.name} | ${mov.transaction_date}`);
            });
        } else {
            console.log('   ⚠️ La consulta no devolvió movimientos aunque haya movimientos activos.');
            console.log('   Esto indica que el inner join está filtrando movimientos que no tienen relación.');
        }
    }
    
    // 6. Verificar movimientos recientes (últimas 24 horas)
    console.log('\n6. Movimientos de las últimas 24 horas:');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString();
    
    const { data: recentMovements, error: recentError } = await supabase
        .from('cash_movements')
        .select('*')
        .gte('transaction_date', yesterdayStr)
        .order('transaction_date', { ascending: false })
        .limit(10);
    
    if (recentError) {
        console.error('❌ Error obteniendo movimientos recientes:', recentError);
    } else {
        console.log(`   Movimientos en últimas 24h: ${recentMovements.length}`);
        if (recentMovements.length === 0) {
            console.log('   ⚠️ No hay movimientos en las últimas 24 horas.');
            console.log('   Si creaste movimientos recientemente, verifica la fecha/hora.');
        } else {
            recentMovements.forEach((mov, i) => {
                console.log(`   ${i+1}. ${mov.id} | ${mov.transaction_date} | ${mov.type} ${mov.amount}`);
            });
        }
    }
    
    // 7. Verificar problema común: fechas en formato incorrecto
    console.log('\n7. Verificando formato de fechas:');
    const { data: sampleMovements, error: sampleError } = await supabase
        .from('cash_movements')
        .select('transaction_date, created_at')
        .limit(1);
    
    if (sampleError) {
        console.error('❌ Error obteniendo muestra de fechas:', sampleError);
    } else if (sampleMovements.length > 0) {
        const mov = sampleMovements[0];
        console.log(`   Ejemplo de transaction_date: ${mov.transaction_date}`);
        console.log(`   Ejemplo de created_at: ${mov.created_at}`);
        console.log(`   Tipo esperado: TIMESTAMP WITH TIME ZONE`);
    }
    
    console.log('\n🔧 Recomendaciones:');
    console.log('1. Si hay movimientos pero no aparecen con inner join:');
    console.log('   - Verificar que cada movimiento tenga category_id válido');
    console.log('   - Verificar que cada movimiento tenga business_unit_id válido');
    console.log('2. Si los movimientos no son activos:');
    console.log('   - Verificar que is_active sea true en la base de datos');
    console.log('3. Si hay problemas de fecha:');
    console.log('   - Los filtros usan fechas en formato YYYY-MM-DD');
    console.log('   - transaction_date es TIMESTAMP WITH TIME ZONE');
    console.log('   - Puede haber desfase de zona horaria');
}

diagnose().catch(err => {
    console.error('Error en diagnóstico:', err);
    process.exit(1);
});