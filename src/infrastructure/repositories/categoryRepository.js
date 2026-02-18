import { supabase } from '../db/supabaseClient.js';

export const categoryRepository = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('movement_categories')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) {
            console.error('[categoryRepo] Error fetching categories:', error);
            throw error;
        }
        
        return data || [];
    },

    getByType: async (type) => {
        const { data, error } = await supabase
            .from('movement_categories')
            .select('*')
            .or(`type.eq.${type},type.eq.BOTH`)
            .order('id', { ascending: true });
        
        if (error) {
            console.error('[categoryRepo] Error fetching categories by type:', error);
            throw error;
        }
        
        return data || [];
    }
};
