const darkColors = {
    primary: '#38ff14', // Neon Green from Stitch
    background: '#0a0a0a', // Deep Dark
    surface: '#1a1a1a',
    surfaceLight: '#2a2a2a',

    text: '#ffffff',
    textSecondary: '#a0a0a0',
    textMuted: '#666666',

    success: '#00e676',
    warning: '#ffc107',
    danger: '#ff1744',
    info: '#2196f3',

    border: '#333333',
    cardBackground: '#121212',

    // Gradients
    primaryGradient: ['#38ff14', '#1faa00'],
    darkGradient: ['#1a1a1a', '#0a0a0a'],
};

const lightColors = {
    primary: '#1faa00', // Darker Green for light mode
    background: '#f8f9fa',
    surface: '#ffffff',
    surfaceLight: '#f1f3f4',

    text: '#1a1a1a',
    textSecondary: '#5f6368',
    textMuted: '#9aa0a6',

    success: '#00c853',
    warning: '#ff9800',
    danger: '#f44336',
    info: '#2196f3',

    border: '#dadce0',
    cardBackground: '#ffffff',

    // Gradients
    primaryGradient: ['#1faa00', '#38ff14'],
    darkGradient: ['#f1f3f4', '#ffffff'],
};

export const colorSchemes = {
    dark: darkColors,
    light: lightColors,
};

// Default export maintains backward compatibility
export const colors = lightColors;
