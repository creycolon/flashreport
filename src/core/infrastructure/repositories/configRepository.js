import { supabase } from '../db/supabaseClient.js';

export const configRepository = {
    get: async (key, defaultValue = null) => {
        const { data, error } = await supabase
            .from('app_config')
            .select('value')
            .eq('key', key)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('[configRepo] Error fetching config:', error);
            throw error;
        }
        
        return data ? data.value : defaultValue;
    },

    set: async (key, value) => {
        const valueStr = String(value);
        const now = new Date().toISOString();
        
        // First try to update existing record
        const { data: existing, error: fetchError } = await supabase
            .from('app_config')
            .select('id')
            .eq('key', key)
            .single();
        
        if (existing) {
            // Update existing
            const { error } = await supabase
                .from('app_config')
                .update({ value: valueStr, updated_at: now })
                .eq('key', key);
            
            if (error) {
                console.error('[configRepo] Error updating config:', error);
                throw error;
            }
        } else {
            // Insert new (no envíes id, la base de datos lo genera automáticamente)
            const { error } = await supabase
                .from('app_config')
                .insert({ key, value: valueStr, updated_at: now });
            
            if (error) {
                console.error('[configRepo] Error inserting config:', error);
                throw error;
            }
        }
        
        return true;
    }
};
