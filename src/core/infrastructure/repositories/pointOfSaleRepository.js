import { supabase } from '../db/supabaseClient.js';

export const pointOfSaleRepository = {
    /**
     * Obtiene todos los puntos de venta de una unidad de negocio
     */
    listByBusinessUnit: async (businessUnitId) => {
        const { data, error } = await supabase
            .from('points_of_sale')
            .select('*')
            .eq('business_unit_id', businessUnitId)
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) {
            console.error('[pointOfSaleRepo] Error listing POS by BU:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Obtiene un punto de venta por ID
     */
    getById: async (id) => {
        const { data, error } = await supabase
            .from('points_of_sale')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('[pointOfSaleRepo] Error fetching POS by id:', error);
            throw error;
        }

        return data;
    },

    /**
     * Crea un nuevo punto de venta
     */
    create: async ({ businessUnitId, name, fiscalId = 'Identificacion Fiscal' }) => {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('points_of_sale')
            .insert({
                business_unit_id: businessUnitId,
                name,
                fiscal_id: fiscalId,
                is_active: true,
                created_at: now
            })
            .select()
            .single();

        if (error) {
            console.error('[pointOfSaleRepo] Error creating POS:', error);
            throw error;
        }

        return data;
    },

    /**
     * Asegura que una unidad de negocio tenga al menos un punto de venta por defecto
     */
    ensureDefaultPOS: async (businessUnitId, businessUnitName) => {
        const existing = await pointOfSaleRepository.listByBusinessUnit(businessUnitId);

        if (existing.length === 0) {
            console.log(`[pointOfSaleRepo] Creating default POS for BU: ${businessUnitName}`);
            return await pointOfSaleRepository.create({
                businessUnitId,
                name: `${businessUnitName} POS 1`,
                fiscalId: 'Identificacion Fiscal'
            });
        }

        return existing[0];
    }
};
