import { supabase } from '../db/supabaseClient.js';
import { pointOfSaleRepository } from './pointOfSaleRepository.js';

export const businessUnitRepository = {
    getAll: async (includeInactive = false) => {
        console.log('[businessUnitRepo] getAll, includeInactive:', includeInactive);

        let query = supabase
            .from('business_units')
            .select('*');

        if (!includeInactive) {
            query = query.eq('is_active', true);
        }

        query = query.order('is_active', { ascending: false })
            .order('display_order', { ascending: true });

        const { data, error } = await query;

        if (error) {
            console.error('[businessUnitRepo] Error fetching business units:', error);
            throw error;
        }

        console.log('[businessUnitRepo] result:', data);
        return data || [];
    },

    getById: async (id) => {
        const { data, error } = await supabase
            .from('business_units')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('[businessUnitRepo] Error fetching business unit by id:', error);
            throw error;
        }

        return data;
    },

    create: async ({ name, color, location, displayOrder = 0 }) => {
        const now = new Date().toISOString();
        const code = `BU-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const { data, error } = await supabase
            .from('business_units')
            .insert({
                name,
                code,
                color,
                location,
                display_order: displayOrder,
                is_active: true,
                created_at: now,
                updated_at: now
            })
            .select()
            .single();

        if (error) {
            console.error('[businessUnitRepo] Error creating business unit:', error);
            throw error;
        }

        // Create default POS for the new Business Unit
        await pointOfSaleRepository.create({
            businessUnitId: data.id,
            name: `${data.name} POS 1`,
            fiscalId: 'Identificación Fiscal'
        });

        return {
            id: data.id,
            name: data.name,
            color: data.color,
            location: data.location,
            displayOrder: data.display_order
        };
    },

    update: async (id, { name, color, location, displayOrder, isActive = true }) => {
        const now = new Date().toISOString();

        const { error } = await supabase
            .from('business_units')
            .update({
                name,
                color,
                location,
                display_order: displayOrder,
                is_active: isActive,
                updated_at: now
            })
            .eq('id', id);

        if (error) {
            console.error('[businessUnitRepo] Error updating business unit:', error);
            throw error;
        }

        return true;
    },

    softDelete: async (id) => {
        const now = new Date().toISOString();

        const { error } = await supabase
            .from('business_units')
            .update({
                is_active: false,
                updated_at: now
            })
            .eq('id', id);

        if (error) {
            console.error('[businessUnitRepo] Error soft deleting business unit:', error);
            throw error;
        }

        return true;
    },

    reactivate: async (id) => {
        const now = new Date().toISOString();

        const { error } = await supabase
            .from('business_units')
            .update({
                is_active: true,
                updated_at: now
            })
            .eq('id', id);

        if (error) {
            console.error('[businessUnitRepo] Error reactivating business unit:', error);
            throw error;
        }

        return true;
    }
};
