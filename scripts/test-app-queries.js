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

// Simular getDateRange de MovementsListScreen
function getDateRange(dateFilter = '7d') {
    const end = new Date();
    const start = new Date();
    if (dateFilter === '1d') start.setHours(0, 0, 0, 0);
    else if (dateFilter === '7d') start.setDate(end.getDate() - 7);
    else if (dateFilter === '30d') start.setDate(end.getDate() - 30);
    else return { start: null, end: null };

    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
}

// Simular listAll del repositorio
async function listAll(limit = 300, offset = 0, startDate = null, endDate = null) {
    console.log('listAll called with:', { limit, offset, startDate, endDate });
    
    let query = supabase
        .from('cash_movements')
        .select(`
            *,
            movement_categories!inner(name, code),
            business_units!inner(name, color)
        `)
        .eq('is_active', true);
    
    if (startDate) {
        query = query.gte('transaction_date', startDate);
    }
    if (endDate) {
        query = query.lte('transaction_date', endDate);
    }
    
    query = query.order('transaction_date', { ascending: false })
                 .order('sequence_number', { ascending: false })
                 .range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    
    if (error) {
        console.error('listAll error:', error);
        throw error;
    }
    
    // Format data to match expected structure
    return data.map(item => ({
        ...item,
        category_name: item.movement_categories?.name,
        category_code: item.movement_categories?.code,
        bu_name: item.business_units?.name,
        bu_color: item.business_units?.color
    }));
}

// Simular listByBusinessUnit
async function listByBusinessUnit(businessUnitId, limit = 200, offset = 0, startDate = null, endDate = null) {
    console.log('listByBusinessUnit called with:', { businessUnitId, limit, offset, startDate, endDate });
    
    let query = supabase
        .from('cash_movements')
        .select(`
            *,
            movement_categories!inner(name, code)
        `)
        .eq('business_unit_id', businessUnitId)
        .eq('is_active', true);
    
    if (startDate) {
        query = query.gte('transaction_date', startDate);
    }
    if (endDate) {
        query = query.lte('transaction_date', endDate);
    }
    
    query = query.order('transaction_date', { ascending: false })
                 .order('sequence_number', { ascending: false })
                 .range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    
    if (error) {
        console.error('listByBusinessUnit error:', error);
        throw error;
    }
    
    return data.map(item => ({
        ...item,
        category_name: item.movement_categories?.name,
        category_code: item.movement_categories?.code
    }));
}

async function testQueries() {
    console.log('🧪 Probando consultas de la app\n');
    
    // Test 1: listAll con filtro de 7 días (default)
    console.log('1. listAll con filtro de 7 días (default):');
    const { start: start7d, end: end7d } = getDateRange('7d');
    console.log('   Rango de fechas:', { start7d, end7d });
    
    try {
        const result = await listAll(300, 0, start7d, end7d);
        console.log(`   Resultado: ${result.length} movimientos`);
        if (result.length > 0) {
            console.log('   Primeros 3 movimientos:');
            result.slice(0, 3).forEach((mov, i) => {
                console.log(`   ${i+1}. ${mov.id} | ${mov.bu_name} | ${mov.category_name} | ${mov.transaction_date} | ${mov.type} ${mov.amount}`);
            });
        } else {
            console.log('   ⚠️ No hay movimientos en los últimos 7 días.');
        }
    } catch (err) {
        console.error('   ❌ Error:', err.message);
    }
    
    // Test 2: listAll sin filtro de fecha (todo)
    console.log('\n2. listAll sin filtro de fecha (todo):');
    try {
        const result = await listAll(300, 0, null, null);
        console.log(`   Resultado: ${result.length} movimientos`);
        if (result.length > 0) {
            console.log('   Último movimiento:', result[0]?.transaction_date);
        }
    } catch (err) {
        console.error('   ❌ Error:', err.message);
    }
    
    // Test 3: listByBusinessUnit para bu1 con 7 días
    console.log('\n3. listByBusinessUnit para bu1 con 7 días:');
    try {
        const result = await listByBusinessUnit('bu1', 200, 0, start7d, end7d);
        console.log(`   Resultado: ${result.length} movimientos para bu1`);
        if (result.length > 0) {
            console.log('   Primeros 3:');
            result.slice(0, 3).forEach((mov, i) => {
                console.log(`   ${i+1}. ${mov.id} | ${mov.category_name} | ${mov.transaction_date} | ${mov.type} ${mov.amount}`);
            });
        }
    } catch (err) {
        console.error('   ❌ Error:', err.message);
    }
    
    // Test 4: Verificar movimientos recién creados (últimas 2 horas)
    console.log('\n4. Movimientos de las últimas 2 horas:');
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    const twoHoursAgoStr = twoHoursAgo.toISOString();
    
    const { data: recent, error: recentError } = await supabase
        .from('cash_movements')
        .select('*')
        .gte('transaction_date', twoHoursAgoStr)
        .order('transaction_date', { ascending: false });
    
    if (recentError) {
        console.error('   ❌ Error:', recentError.message);
    } else {
        console.log(`   Encontrados: ${recent.length} movimientos en últimas 2 horas`);
        if (recent.length > 0) {
            recent.forEach((mov, i) => {
                console.log(`   ${i+1}. ${mov.id} | ${mov.business_unit_id} | ${mov.transaction_date} | ${mov.type} ${mov.amount}`);
            });
        }
    }
    
    // Test 5: Verificar si los movimientos recientes tienen relaciones
    console.log('\n5. Verificando relaciones de movimientos recientes:');
    if (recent && recent.length > 0) {
        for (const mov of recent.slice(0, 3)) {
            const { data: cat, error: catErr } = await supabase
                .from('movement_categories')
                .select('name')
                .eq('id', mov.category_id)
                .single();
            
            const { data: bu, error: buErr } = await supabase
                .from('business_units')
                .select('name')
                .eq('id', mov.business_unit_id)
                .single();
            
            console.log(`   Movimiento ${mov.id}:`);
            console.log(`     Categoría: ${catErr ? 'ERROR' : cat?.name} (${mov.category_id})`);
            console.log(`     Business Unit: ${buErr ? 'ERROR' : bu?.name} (${mov.business_unit_id})`);
        }
    }
    
    console.log('\n🎯 Análisis:');
    console.log('Si listAll con 7 días devuelve 0 movimientos pero hay movimientos recientes:');
    console.log('   - Posible problema con el filtro de fecha (zona horaria)');
    console.log('   - Los movimientos pueden tener fechas incorrectas');
    console.log('Si listAll sin filtro devuelve movimientos pero con filtro no:');
    console.log('   - Los movimientos son más antiguos de 7 días');
    console.log('   - El usuario necesita cambiar el filtro a "Todo"');
}

testQueries().catch(err => {
    console.error('Error en test:', err);
    process.exit(1);
});