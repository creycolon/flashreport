import { supabase } from '../../infrastructure/db/supabaseClient';

export const authService = {
    signIn: async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return { error: error.message };
            }

            if (data.user) {
                await authService.syncPartnerEmail(data.user.id, email);
                const partner = await authService.getPartnerBySupabaseId(data.user.id);
                return { 
                    user: data.user,
                    session: data.session,
                    partner
                };
            }

            return { error: 'No se pudo iniciar sesión' };
        } catch (error: any) {
            return { error: error.message || 'Error desconocido' };
        }
    },

    signUp: async (email: string, password: string, partnerId: number) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) {
                return { error: error.message };
            }

            if (data.user) {
                await authService.linkPartnerToSupabase(partnerId, data.user.id);
                await authService.syncPartnerEmail(data.user.id, email);
                const partner = await authService.getPartnerById(partnerId);
                return { 
                    user: data.user,
                    session: data.session,
                    partner
                };
            }

            return { error: 'No se pudo registrar' };
        } catch (error: any) {
            return { error: error.message || 'Error desconocido' };
        }
    },

    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                return { error: error.message };
            }
            return { success: true };
        } catch (error: any) {
            return { error: error.message };
        }
    },

    getCurrentUser: async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                return { user: null, error: error.message };
            }

            return { user };
        } catch (error: any) {
            return { user: null, error: error.message };
        }
    },

    getSession: async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                return { session: null, error: error.message };
            }

            return { session };
        } catch (error: any) {
            return { session: null, error: error.message };
        }
    },

    getCurrentPartner: async () => {
        try {
            const { user, error: authError } = await supabase.auth.getUser();
            
            if (authError || !user) {
                return { partner: null, error: authError?.message };
            }

            const { data: partner, error: partnerError } = await supabase
                .from('partners')
                .select('*')
                .eq('supabase_id', user.id)
                .single();

            if (partnerError) {
                return { partner: null, error: partnerError.message };
            }

            return { partner };
        } catch (error: any) {
            return { partner: null, error: error.message };
        }
    },

    getPartnerBySupabaseId: async (supabaseId: string) => {
        try {
            const { data: partner, error } = await supabase
                .from('partners')
                .select('*')
                .eq('supabase_id', supabaseId)
                .single();

            if (error) {
                return null;
            }

            return partner;
        } catch (error) {
            return null;
        }
    },

    getPartnerById: async (partnerId: number) => {
        try {
            const { data: partner, error } = await supabase
                .from('partners')
                .select('*')
                .eq('id', partnerId)
                .single();

            if (error) {
                return null;
            }

            return partner;
        } catch (error) {
            return null;
        }
    },

    linkPartnerToSupabase: async (partnerId: number, supabaseId: string) => {
        try {
            const { error } = await supabase
                .from('partners')
                .update({ supabase_id: supabaseId })
                .eq('id', partnerId);

            if (error) {
                console.error('[AuthService] Error linking partner:', error);
                return { error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { error: error.message };
        }
    },

    syncPartnerEmail: async (supabaseId: string, email: string) => {
        try {
            const { error } = await supabase
                .from('partners')
                .update({ email: email })
                .eq('supabase_id', supabaseId);

            if (error) {
                console.error('[AuthService] Error syncing email:', error);
                return { error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { error: error.message };
        }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return supabase.auth.onAuthStateChange(callback);
    },

    resetPassword: async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'flashreport://reset-password'
            });

            if (error) {
                return { error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { error: error.message };
        }
    },

    updatePassword: async (newPassword: string) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                return { error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { error: error.message };
        }
    }
};
