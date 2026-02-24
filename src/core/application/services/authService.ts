import { supabase } from '../../infrastructure/db/supabaseClient';

export const authService = {
    signIn: async (email: string, password: string) => {
        try {
            console.log('[AuthService] signIn called with:', email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            console.log('[AuthService] Supabase response - data:', !!data, 'error:', error);

            if (error) {
                console.log('[AuthService] Supabase error:', error.message);
                return { error: error.message };
            }

            if (data.user) {
                console.log('[AuthService] User found:', data.user.id);
                await authService.syncPartnerEmail(data.user.id, email);
                const partner = await authService.getPartnerBySupabaseId(data.user.id);
                console.log('[AuthService] Partner found:', partner);
                return { 
                    user: data.user,
                    session: data.session,
                    partner
                };
            }

            return { error: 'No se pudo iniciar sesión' };
        } catch (error: any) {
            console.log('[AuthService] Catch error:', error);
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

    uploadAvatar: async (partnerId: number, imageUri: string): Promise<{ url?: string; error?: string }> => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                return { error: 'Usuario no autenticado' };
            }

            const fileName = `avatar_${partnerId}_${Date.now()}.jpg`;
            
            const response = await fetch(imageUri);
            const blob = await response.blob();

            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(user.id + '/' + fileName, blob, {
                    upsert: true,
                    contentType: 'image/jpeg'
                });

            if (error) {
                console.error('[AuthService] Error uploading avatar:', error);
                return { error: error.message };
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(user.id + '/' + fileName);

            await authService.updatePartnerImage(partnerId, publicUrl);

            return { url: publicUrl };
        } catch (error: any) {
            console.error('[AuthService] Error uploading avatar:', error);
            return { error: error.message || 'Error al subir imagen' };
        }
    },

    updatePartnerImage: async (partnerId: number, imageUrl: string) => {
        try {
            const { error } = await supabase
                .from('partners')
                .update({ image: imageUrl })
                .eq('id', partnerId);

            if (error) {
                console.error('[AuthService] Error updating partner image:', error);
                return { error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { error: error.message };
        }
    },

    updatePartner: async (partnerId: number, data: { name?: string; email?: string; phone?: string; address?: string }) => {
        try {
            const { error } = await supabase
                .from('partners')
                .update(data)
                .eq('id', partnerId);

            if (error) {
                console.error('[AuthService] Error updating partner:', error);
                return { error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { error: error.message };
        }
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
