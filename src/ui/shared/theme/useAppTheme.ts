import { useEffect, useState } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { configRepository } from '@core/infrastructure/repositories/configRepository';
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
            const saved = await (configRepository as any).get('default_mode', 'auto');
            const validPreference: ThemePreference = ['auto', 'dark', 'light'].includes(saved) ? saved : 'auto';
            setThemePreference(validPreference);
        } catch (error) {
            console.error('Error loading theme preference:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveThemePreference = async (preference: ThemePreference) => {
        try {
            await (configRepository as any).set('default_mode', preference);
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
        
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setWebDetectedScheme(e.matches ? 'dark' : 'light');
        };
        
        setWebDetectedScheme(darkModeMediaQuery.matches ? 'dark' : 'light');
        
        if (darkModeMediaQuery.addEventListener) {
            darkModeMediaQuery.addEventListener('change', handleChange);
        }
        
        return () => {
            if (darkModeMediaQuery.removeEventListener) {
                darkModeMediaQuery.removeEventListener('change', handleChange);
            }
        };
    }, []);

    // Determine which color scheme to use
    const finalDeviceColorScheme = Platform.OS === 'web' && webDetectedScheme 
        ? webDetectedScheme 
        : deviceColorScheme;
    
    const effectiveColorScheme = themePreference === 'auto' 
        ? (finalDeviceColorScheme || 'dark') 
        : themePreference;
    
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