import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@ui/shared/theme/ThemeContext';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <Stack screenOptions={{ headerShown: false }} />
                <StatusBar style="light" />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
