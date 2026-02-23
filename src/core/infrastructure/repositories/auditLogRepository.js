import { supabase } from '../db/supabaseClient.js';

export const auditLogRepository = {
    create: async (log) => {
        const { data, error } = await supabase
            .from('audit_logs')
            .insert({
                user_id: log.userId || null,
                action: log.action,
                entity_type: log.entityType || null,
                entity_id: log.entityId || null,
                details: log.details || {},
                business_unit_filter: log.businessUnitFilter,
                period_filter: log.periodFilter,
                period_days: log.periodDays,
                period_start: log.periodStart,
                period_end: log.periodEnd,
            })
            .select()
            .single();

        if (error) {
            console.error('[AuditLogRepo] Error creating log:', error);
            throw error;
        }

        return data;
    },

    list: async (limit = 50, offset = 0) => {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('[AuditLogRepo] Error listing logs:', error);
            throw error;
        }

        return data || [];
    },

    listByUser: async (userId, limit = 50) => {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[AuditLogRepo] Error listing logs by user:', error);
            throw error;
        }

        return data || [];
    },

    listByBusinessUnit: async (businessUnitFilter, limit = 50) => {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('business_unit_filter', businessUnitFilter)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[AuditLogRepo] Error listing logs by business unit:', error);
            throw error;
        }

        return data || [];
    }
};
