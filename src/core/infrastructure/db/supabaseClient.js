import { createClient } from '@supabase/supabase-js';

let supabaseUrl = '';
let supabaseAnonKey = '';

// Try to get from Expo constants (React Native)
try {
    const Constants = require('expo-constants').default || require('expo-constants');
    if (Constants.expoConfig?.extra) {
        supabaseUrl = Constants.expoConfig.extra.supabaseUrl || '';
        supabaseAnonKey = Constants.expoConfig.extra.supabaseAnonKey || '';
    }
} catch (e) {
    // expo-constants not available, continue to process.env
}

// Fallback to process.env (Node.js, web, development)
if (!supabaseUrl || !supabaseAnonKey) {
    supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
}

// Validate credentials
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials missing. Please check your environment variables.');
    console.warn('URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
    console.warn('Anon Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    }
});