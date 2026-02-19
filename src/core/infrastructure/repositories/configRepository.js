import { supabase } from '../db/supabaseClient.js';
import { generateId } from '../../application/utils/idGenerator.js';

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
        const id = generateId();
        
        // Upsert using Supabase's upsert (ON CONFLICT)
        const { error } = await supabase
            .from('app_config')
            .upsert({
                id,
                key,
                value: valueStr,
                updated_at: now
            }, {
                onConflict: 'key'
            });
        
        if (error) {
            console.error('[configRepo] Error setting config:', error);
            throw error;
        }
        
        return true;
    }
};
