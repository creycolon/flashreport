import React, { createContext, useContext, ReactNode } from 'react';
import { useAppTheme, ThemePreference } from './useAppTheme';
import { colorSchemes } from './colors';

const DEBUG_SKIP_THEME = false;

export type ColorScheme = 'dark' | 'light';

interface ThemeContextType {
    colors: typeof colorSchemes.dark;
    themePreference: ThemePreference;
    setThemePreference: (preference: ThemePreference) => Promise<void>;
    effectiveColorScheme: ColorScheme;
    loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    if (DEBUG_SKIP_THEME) {
        const fixedTheme = {
            colors: colorSchemes.light,
            themePreference: 'light' as ThemePreference,
            setThemePreference: async () => {},
            effectiveColorScheme: 'light' as const,
            loading: false,
        };
        return (
            <ThemeContext.Provider value={fixedTheme}>
                {children}
            </ThemeContext.Provider>
        );
    }
    
    const theme = useAppTheme();
    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};