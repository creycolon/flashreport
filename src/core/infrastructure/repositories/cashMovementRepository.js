import { supabase } from '../db/supabaseClient.js';
import { partnerRepository } from './partnerRepository.js';

export const cashMovementRepository = {
    create: async (movement) => {
        try {
            console.log('[CashMovementRepo] Creating movement for BU:', movement.businessUnitId);

            // 1. Get next sequence number for this Business Unit
            const { data: lastMovement, error: seqError } = await supabase
                .from('cash_movements')
                .select('sequence_number')
                .eq('business_unit_id', movement.businessUnitId)
                .order('sequence_number', { ascending: false })
                .limit(1)
                .single();

            let sequenceNumber = 1;
            if (!seqError && lastMovement && lastMovement.sequence_number) {
                sequenceNumber = lastMovement.sequence_number + 1;
            }
            console.log(`[CashMovementRepo] Last seq: ${lastMovement?.sequence_number}, Next: ${sequenceNumber}`);

            // 2. Validate created_by partner if provided
            if (movement.createdBy) {
                console.log(`[CashMovementRepo] Validating created_by partner: ${movement.createdBy}`);
                try {
                    const partner = await partnerRepository.getById(movement.createdBy);
                    if (!partner || !partner.is_active) {
                        throw new Error(`Partner ${movement.createdBy} is not active or not found`);
                    }
                    console.log(`[CashMovementRepo] Partner validated: ${partner.name}`);
                } catch (error) {
                    console.error('[CashMovementRepo] Invalid partner for created_by:', error);
                    throw new Error(`Invalid partner for created_by: ${error.message}`);
                }
            }

            // 3. Insert movement
            console.log(`[CashMovementRepo] Inserting: amount=${movement.amount}, date=${movement.date}, category=${movement.categoryId}`);

            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from('cash_movements')
                .insert({
                    business_unit_id: movement.businessUnitId,
                    transaction_date: movement.date || now,
                    type: movement.type,
                    category_id: movement.categoryId,
                    amount: movement.amount,
                    description: movement.description || '',
                    reference_id: movement.referenceId || null,
                    partner_account_id: movement.partnerAccountId || null,
                    created_by: movement.createdBy || null,
                    point_of_sale_id: movement.pointOfSaleId || null,
                    sequence_number: sequenceNumber,
                    is_active: true,
                    created_at: now
                })
                .select()
                .single();

            if (error) {
                console.error('[CashMovementRepo] Error creating movement:', error);
                throw error;
            }

            console.log(`[CashMovementRepo] Movement created: ${data.id}, seq=${sequenceNumber}`);
            return { ...movement, id: data.id, sequenceNumber };
        } catch (error) {
            console.error('[CashMovementRepo] Error creating movement:', error);
            throw error;
        }
    },

    listByBusinessUnit: async (businessUnitId, limit = 100, offset = 0, startDate = null, endDate = null) => {
        let query = supabase
            .from('cash_movements')
            .select(`
                *,
                movement_categories!inner(name, code),
                business_units!inner(name, color),
                points_of_sale(name)
            `)
            .eq('business_unit_id', businessUnitId)
            .eq('is_active', true);

        if (startDate) {
            // Convert date string to ISO format for Supabase
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
            console.error('[CashMovementRepo] Error listing movements by BU:', error);
            throw error;
        }

        // Format data to match expected structure
        return data.map(item => ({
            ...item,
            category_name: item.movement_categories?.name,
            category_code: item.movement_categories?.code,
            bu_name: item.business_units?.name,
            bu_color: item.business_units?.color,
            pos_name: item.points_of_sale?.name || 'N/A'
        }));
    },

    getBalance: async (businessUnitId, startDate = null, endDate = null) => {
        let query = supabase
            .from('cash_movements')
            .select('type, amount')
            .eq('business_unit_id', businessUnitId)
            .eq('is_active', true);

        if (startDate) query = query.gte('transaction_date', startDate);
        if (endDate) query = query.lte('transaction_date', endDate);

        const { data, error } = await query;

        if (error) {
            console.error('[CashMovementRepo] Error getting balance:', error);
            throw error;
        }

        // Calculate in memory (for few records) or use PostgreSQL function
        const totals = data.reduce((acc, mov) => {
            if (mov.type === 'CR') {
                acc.credits += parseFloat(mov.amount);
                acc.ticket_count += 1;
            } else {
                acc.debits += parseFloat(mov.amount);
            }
            return acc;
        }, { credits: 0, debits: 0, ticket_count: 0 });

        return {
            total_credits: totals.credits,
            total_debits: totals.debits,
            ticket_count: totals.ticket_count,
            balance: totals.credits - totals.debits
        };
    },

    listAll: async (limit = 100, offset = 0, startDate = null, endDate = null) => {
        let query = supabase
            .from('cash_movements')
            .select(`
                *,
                movement_categories!inner(name, code),
                business_units!inner(name, color),
                points_of_sale(name)
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
            console.error('[CashMovementRepo] Error listing all movements:', error);
            throw error;
        }

        // Format data to match expected structure
        return data.map(item => ({
            ...item,
            category_name: item.movement_categories?.name,
            category_code: item.movement_categories?.code,
            bu_name: item.business_units?.name,
            bu_color: item.business_units?.color,
            pos_name: item.points_of_sale?.name || 'N/A'
        }));
    },

    getGlobalBalance: async (startDate = null, endDate = null) => {
        // For Supabase, we need to use a PostgreSQL function or calculate in memory
        // Since we're fetching all records for the date range, we'll use getBalance logic but for all BUs
        let query = supabase
            .from('cash_movements')
            .select('type, amount')
            .eq('is_active', true);

        if (startDate) query = query.gte('transaction_date', startDate);
        if (endDate) query = query.lte('transaction_date', endDate);

        const { data, error } = await query;

        if (error) {
            console.error('[CashMovementRepo] Error getting global balance:', error);
            throw error;
        }

        const totals = data.reduce((acc, mov) => {
            if (mov.type === 'CR') {
                acc.credits += parseFloat(mov.amount);
                acc.ticket_count += 1;
            } else {
                acc.debits += parseFloat(mov.amount);
            }
            return acc;
        }, { credits: 0, debits: 0, ticket_count: 0 });

        return {
            total_credits: totals.credits,
            total_debits: totals.debits,
            ticket_count: totals.ticket_count,
            balance: totals.credits - totals.debits
        };
    },

    updateDescription: async (id, description) => {
        const { error } = await supabase
            .from('cash_movements')
            .update({ description })
            .eq('id', id);

        if (error) {
            console.error('[CashMovementRepo] Error updating description:', error);
            throw error;
        }
    },

    deactivatePeriod: async (businessUnitId, periodLabel) => {
        const { error } = await supabase
            .from('cash_movements')
            .update({
                is_active: false,
                closed_period: periodLabel
            })
            .eq('business_unit_id', businessUnitId)
            .eq('is_active', true);

        if (error) {
            console.error('[CashMovementRepo] Error deactivating period:', error);
            throw error;
        }
    },

    getDailySales: async (businessUnitId, days = 7) => {
        console.log('[cashMovementRepo] getDailySales BU:', businessUnitId, 'days:', days);

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // For Supabase, we need to use a PostgreSQL function for grouping by date
        // We'll use rpc (remote procedure call) or do grouping in memory
        // For now, fetch all and group in memory (not efficient for large datasets)
        const { data, error } = await supabase
            .from('cash_movements')
            .select('transaction_date, amount')
            .eq('business_unit_id', businessUnitId)
            .eq('type', 'CR')
            .eq('is_active', true)
            .gte('transaction_date', startDate.toISOString())
            .lte('transaction_date', endDate.toISOString());

        if (error) {
            console.error('[CashMovementRepo] Error getting daily sales:', error);
            throw error;
        }

        // Group by date
        const grouped = data.reduce((acc, mov) => {
            const date = new Date(mov.transaction_date).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date] += parseFloat(mov.amount);
            return acc;
        }, {});

        // Convert to array
        const result = Object.entries(grouped).map(([day, total]) => ({
            day,
            total
        })).sort((a, b) => a.day.localeCompare(b.day));

        console.log('[cashMovementRepo] result:', result);
        return result;
    },

    softDelete: async (id) => {
        const { error } = await supabase
            .from('cash_movements')
            .update({ is_active: false })
            .eq('id', id);

        if (error) {
            console.error('[CashMovementRepo] Error soft deleting:', error);
            throw error;
        }
    },

    getLastMovementForBU: async (businessUnitId) => {
        const { data, error } = await supabase
            .from('cash_movements')
            .select('*')
            .eq('business_unit_id', businessUnitId)
            .eq('is_active', true)
            .order('sequence_number', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // No rows
            console.error('[CashMovementRepo] Error getting last movement:', error);
            throw error;
        }

        return data || null;
    }
};
