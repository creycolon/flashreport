import { useEffect, useState } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { configRepository } from '../../infrastructure/repositories/configRepository';
import { colorSchemes } from './colors';

export type ThemePreference = 'auto' | 'dark' | 'light';

export const useAppTheme = () => {
    const deviceColorScheme = useColorScheme();
    const [themePreference, setThemePreference] = useState<ThemePreference>('auto');
    const [loading, setLoading] = useState(true);
    const [webDetectedScheme, setWebDetectedScheme] = useState<'light' | 'dark' | null>(null);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const saved = await (configRepository as any).get('theme_preference', 'auto');
            console.log('[useAppTheme] Loaded theme preference from config:', { saved, default: 'auto' });
            // Si no hay valor guardado o es inválido, usar 'auto'
            const validPreference: ThemePreference = ['auto', 'dark', 'light'].includes(saved) ? saved : 'auto';
            console.log('[useAppTheme] Valid theme preference:', validPreference);
            setThemePreference(validPreference);
        } catch (error) {
            console.error('Error loading theme preference:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveThemePreference = async (preference: ThemePreference) => {
        try {
            await (configRepository as any).set('theme_preference', preference);
            setThemePreference(preference);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    // Detect color scheme on web using matchMedia
    useEffect(() => {
        if (Platform.OS !== 'web' || typeof window === 'undefined') {
            return;
        }

        console.log('[useAppTheme] Setting up web color scheme detection');
        
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const newScheme = e.matches ? 'dark' : 'light';
            console.log('[useAppTheme] Web color scheme changed:', newScheme);
            setWebDetectedScheme(newScheme);
        };
        
        // Set initial value
        const initialScheme = darkModeMediaQuery.matches ? 'dark' : 'light';
        console.log('[useAppTheme] Initial web color scheme:', initialScheme);
        setWebDetectedScheme(initialScheme);
        
        // Add listener
        if (darkModeMediaQuery.addEventListener) {
            darkModeMediaQuery.addEventListener('change', handleChange);
        } else {
            // Fallback for older browsers
            darkModeMediaQuery.addListener(handleChange);
        }
        
        return () => {
            if (darkModeMediaQuery.removeEventListener) {
                darkModeMediaQuery.removeEventListener('change', handleChange);
            } else if (darkModeMediaQuery.removeListener) {
                darkModeMediaQuery.removeListener(handleChange);
            }
        };
    }, []);

    // Determine which color scheme to use
    // Combine device color scheme with web detection if needed
    const finalDeviceColorScheme = Platform.OS === 'web' && webDetectedScheme 
        ? webDetectedScheme 
        : deviceColorScheme;
    
    console.log('[useAppTheme] Determining effective color scheme:', { 
        themePreference, 
        deviceColorScheme, 
        webDetectedScheme,
        finalDeviceColorScheme 
    });
    
    const effectiveColorScheme = themePreference === 'auto' 
        ? (finalDeviceColorScheme || 'dark') 
        : themePreference;
    
    console.log('[useAppTheme] effectiveColorScheme:', effectiveColorScheme);
    
    const colorSchemeKey = effectiveColorScheme === 'dark' ? 'dark' : 'light';
    const colors = colorSchemes[colorSchemeKey];

    return {
        colors,
        themePreference,
        setThemePreference: saveThemePreference,
        effectiveColorScheme,
        loading,
    };
};