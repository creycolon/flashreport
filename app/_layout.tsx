import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { ThemeProvider } from '@ui/shared/theme/ThemeContext';
import * as NavigationBar from 'expo-navigation-bar';

export default function RootLayout() {
    useEffect(() => {
        if (Platform.OS === 'android') {
            // Establecer color de la barra de navegación del sistema
            NavigationBar.setBackgroundColorAsync('#2d2d2d');
            NavigationBar.setButtonStyleAsync('light');
        }
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <Stack screenOptions={{ headerShown: false }} />
                <StatusBar style="light" />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
