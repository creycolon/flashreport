export default {
  expo: {
    // ... config existente
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      // Mantener compatibilidad
      useSupabase: true,
      offlineMode: false
    }
  }
};