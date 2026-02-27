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

async function debugMovement(movementId) {
    console.log(`🔍 Debugging movement: ${movementId}\n`);
    
    // 1. Obtener el movimiento directamente
    const { data: movement, error: movError } = await supabase
        .from('cash_movements')
        .select('*')
        .eq('id', movementId)
        .single();
    
    if (movError) {
        console.error('❌ Error obteniendo movimiento:', movError);
        return;
    }
    
    console.log('1. Datos del movimiento:');
    console.log(`   ID: ${movement.id}`);
    console.log(`   BU: ${movement.business_unit_id}`);
    console.log(`   Categoría: ${movement.category_id}`);
    console.log(`   Tipo: ${movement.type}`);
    console.log(`   Monto: ${movement.amount}`);
    console.log(`   Fecha: ${movement.transaction_date}`);
    console.log(`   is_active: ${movement.is_active}`);
    console.log(`   sequence_number: ${movement.sequence_number}`);
    
    // 2. Verificar categoría
    const { data: category, error: catError } = await supabase
        .from('movement_categories')
        .select('*')
        .eq('id', movement.category_id)
        .single();
    
    if (catError) {
        console.error('❌ Error obteniendo categoría:', catError);
    } else {
        console.log(`\n2. Categoría: ${category.name} (${category.code})`);
    }
    
    // 3. Verificar business unit
    const { data: bu, error: buError } = await supabase
        .from('business_units')
        .select('*')
        .eq('id', movement.business_unit_id)
        .single();
    
    if (buError) {
        console.error('❌ Error obteniendo business unit:', buError);
    } else {
        console.log(`\n3. Business Unit: ${bu.name} (active: ${bu.is_active})`);
    }
    
    // 4. Probar la consulta exacta de listAll
    console.log('\n4. Probando consulta listAll con este movimiento:');
    
    // Primero ver si está en el rango de 7 días
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDate = now.toISOString().split('T')[0];
    
    console.log(`   Rango 7 días: ${startDate} a ${endDate}`);
    console.log(`   Fecha movimiento: ${movement.transaction_date}`);
    
    // Convertir a Date para comparación
    const movDate = new Date(movement.transaction_date);
    const movDateStr = movDate.toISOString().split('T')[0];
    console.log(`   Fecha movimiento (solo fecha): ${movDateStr}`);
    
    if (movDateStr >= startDate && movDateStr <= endDate) {
        console.log('   ✅ El movimiento está dentro del rango de 7 días');
    } else {
        console.log('   ❌ El movimiento NO está dentro del rango de 7 días');
        console.log(`      ${movDateStr} < ${startDate} o > ${endDate}`);
    }
    
    // 5. Probar la consulta con inner join
    console.log('\n5. Consulta con inner join (como la app):');
    const { data: withJoin, error: joinError } = await supabase
        .from('cash_movements')
        .select(`
            *,
            movement_categories!inner(name, code),
            business_units!inner(name, color)
        `)
        .eq('id', movementId)
        .eq('is_active', true);
    
    if (joinError) {
        console.error('   ❌ Error en inner join:', joinError);
    } else {
        console.log(`   Resultado: ${withJoin.length} movimientos`);
        if (withJoin.length === 0) {
            console.log('   ⚠️ El inner join NO devuelve este movimiento');
            console.log('   Posible causa: relación faltante o !inner estricto');
        } else {
            console.log('   ✅ Inner join devuelve el movimiento');
        }
    }
    
    // 6. Probar sin !inner (left join)
    console.log('\n6. Consulta con left join:');
    const { data: withLeftJoin, error: leftError } = await supabase
        .from('cash_movements')
        .select(`
            *,
            movement_categories(name, code),
            business_units(name, color)
        `)
        .eq('id', movementId)
        .eq('is_active', true);
    
    if (leftError) {
        console.error('   ❌ Error en left join:', leftError);
    } else {
        console.log(`   Resultado: ${withLeftJoin.length} movimientos`);
    }
    
    // 7. Verificar problema de zona horaria
    console.log('\n7. Análisis de zona horaria:');
    console.log(`   Fecha movimiento (ISO): ${movement.transaction_date}`);
    console.log(`   Fecha actual (local): ${new Date().toISOString()}`);
    console.log(`   Diferencia horas con UTC: ${new Date().getTimezoneOffset() / 60} horas`);
    
    // 8. ¿El movimiento es visible en el dashboard?
    console.log('\n8. ¿Visible en dashboard (getBalance)?');
    const { data: balanceData, error: balanceError } = await supabase
        .from('cash_movements')
        .select('type, amount')
        .eq('business_unit_id', movement.business_unit_id)
        .eq('is_active', true)
        .gte('transaction_date', startDate + 'T00:00:00Z')
        .lte('transaction_date', endDate + 'T23:59:59Z');
    
    if (balanceError) {
        console.error('   ❌ Error en getBalance:', balanceError);
    } else {
        const includesThisMov = balanceData.some(m => 
            m.amount === movement.amount && 
            new Date(movement.transaction_date).getTime() - new Date(m.transaction_date).getTime() < 1000
        );
        console.log(`   Incluye este movimiento: ${includesThisMov ? '✅ Sí' : '❌ No'}`);
        console.log(`   Total movimientos en rango para este BU: ${balanceData.length}`);
    }
    
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Si no está en rango de 7 días: Cambiar filtro a "Todo" en la app');
    console.log('2. Si inner join falla: Cambiar !inner por left join en repositorios');
    console.log('3. Si zona horaria es problema: Usar fechas UTC en filtros');
    console.log('4. Si categoría es cat5 (Reembolso): Verificar pantalla de agregar movimientos');
}

// Debug los movimientos más recientes
const recentMovements = [
    '6w87feyh4pyps1rdjs',  // Más reciente
    '6xtd2yx2p26jnr9pgo',
    'dgg505uewbxb8l8oai'
];

async function runDebug() {
    for (const movId of recentMovements) {
        await debugMovement(movId);
        console.log('\n' + '='.repeat(50) + '\n');
    }
}

runDebug().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});