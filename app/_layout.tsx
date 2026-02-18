import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ThemeProvider } from '../src/ui/theme/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppInitializer } from '../src/ui/components/AppInitializer';

function AppContent() {
    console.error('🔴 APP CONTENT: Rendering Stack navigator');
    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="light" />
        </>
    );
}

export default function RootLayout() {
    console.error('🔴 ROOT LAYOUT: Component rendered');
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <AppInitializer silent={false}>
                    <AppContent />
                </AppInitializer>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
