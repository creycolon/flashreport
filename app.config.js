export default {
  expo: {
    // ... config existente
    scheme: 'flashreport',
    android: {
      package: "com.creycolon.flashreport"
    },
    ios: {
      bundleIdentifier: "com.creycolon.flashreport",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      // Mantener compatibilidad
      useSupabase: true,
      offlineMode: false,
      eas: {
        projectId: "b25bddbf-6847-445a-8c92-4db29f7e459e"
      }
    }
  }
};