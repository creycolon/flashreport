import { supabase } from '../db/supabaseClient.js';

export const partnerRepository = {
    getAll: async (includeInactive = false) => {
        let query = supabase
            .from('partners')
            .select('*');

        if (!includeInactive) {
            query = query.eq('is_active', true);
        }

        query = query.order('is_active', { ascending: false })
            .order('name', { ascending: true });

        const { data, error } = await query;

        if (error) {
            console.error('[partnerRepo] Error fetching partners:', error);
            throw error;
        }

        return data || [];
    },

    _ensureSingleManagingPartner: async (excludeId = null) => {
        // Build query to update all other partners to not be managing partner
        let query = supabase
            .from('partners')
            .update({
                is_managing_partner: false,
                updated_at: new Date().toISOString()
            })
            .eq('is_active', true)
            .eq('is_managing_partner', true);

        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        const { error } = await query;

        if (error) {
            console.error('[partnerRepo] Error clearing other managing partners:', error);
            throw error;
        }

        return true;
    },

    getById: async (id) => {
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('[partnerRepo] Error fetching partner by id:', error);
            throw error;
        }

        return data;
    },

    getAccountByPartnerId: async (partnerId) => {
        const { data, error } = await supabase
            .from('partner_accounts')
            .select('*')
            .eq('partner_id', partnerId)
            .single();

        if (error && error.code !== 'PGRST116') { // No rows
            console.error('[partnerRepo] Error fetching partner account:', error);
            throw error;
        }

        return data || null;
    },

    create: async function ({ name, alias, participationPercentage, role, isManagingPartner = 0, id = null }) {
        const now = new Date().toISOString();
        const { data: newPartner, error: partnerError } = await supabase
            .from('partners')
            .insert({
                name,
                alias,
                participation_percentage: participationPercentage,
                role,
                is_managing_partner: isManagingPartner,
                is_active: true,
                created_at: now,
                updated_at: now
            })
            .select()
            .single();

        if (partnerError) {
            console.error('[partnerRepo] Error creating partner:', partnerError);
            throw partnerError;
        }

        const partnerId = newPartner.id;

        // Ensure only one managing partner if this partner is being set as managing
        if (isManagingPartner === 1 || isManagingPartner === true) {
            await this._ensureSingleManagingPartner(partnerId);
        }

        // 2. Create Partner Account
        const { error: accountError } = await supabase
            .from('partner_accounts')
            .insert({
                partner_id: partnerId,
                current_balance: 0,
                created_at: now,
                updated_at: now
            });

        if (accountError) {
            console.error('[partnerRepo] Error creating partner account:', accountError);
            throw accountError;
        }

        return { id: partnerId, name, alias, participationPercentage, role };
    },

    update: async function (id, { name, alias, participationPercentage, role, isManagingPartner, isActive = 1 }) {
        const now = new Date().toISOString();

        // Ensure only one managing partner if this partner is being set as managing
        if (isManagingPartner === 1 || isManagingPartner === true) {
            await this._ensureSingleManagingPartner(id);
        }

        const { error } = await supabase
            .from('partners')
            .update({
                name,
                alias,
                participation_percentage: participationPercentage,
                role,
                is_managing_partner: isManagingPartner,
                is_active: isActive,
                updated_at: now
            })
            .eq('id', id);

        if (error) {
            console.error('[partnerRepo] Error updating partner:', error);
            throw error;
        }

        return true;
    },

    softDelete: async (id) => {
        const now = new Date().toISOString();

        const { error } = await supabase
            .from('partners')
            .update({
                is_active: false,
                updated_at: now
            })
            .eq('id', id);

        if (error) {
            console.error('[partnerRepo] Error soft deleting partner:', error);
            throw error;
        }

        return true;
    },

    reactivate: async (id) => {
        const now = new Date().toISOString();

        const { error } = await supabase
            .from('partners')
            .update({
                is_active: true,
                updated_at: now
            })
            .eq('id', id);

        if (error) {
            console.error('[partnerRepo] Error reactivating partner:', error);
            throw error;
        }

        return true;
    },

    updateBalance: async (accountId, newBalance) => {
        const now = new Date().toISOString();

        const { error } = await supabase
            .from('partner_accounts')
            .update({
                current_balance: newBalance,
                updated_at: now
            })
            .eq('id', accountId);

        if (error) {
            console.error('[partnerRepo] Error updating balance:', error);
            throw error;
        }
    },

    recordTransaction: async (accountId, type, amount, origin, description, createdBy) => {
        const now = new Date().toISOString();
        const { error } = await supabase
            .from('partner_account_transactions')
            .insert({
                partner_account_id: accountId,
                transaction_date: now,
                type,
                origin,
                amount,
                description,
                created_by: createdBy,
                created_at: now
            });

        if (error) {
            console.error('[partnerRepo] Error recording transaction:', error);
            throw error;
        }

        return id;
    }
};
