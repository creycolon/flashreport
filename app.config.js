export default {
  expo: {
    name: "Flash Report",
    slug: "flashreport",
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
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      useSupabase: true,
      offlineMode: false,
      eas: {
        projectId: "ec1f7118-0ec3-4033-aa9a-5a4826745eb3"
      }
    }
  }
};