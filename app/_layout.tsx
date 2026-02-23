import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@ui/shared/theme/ThemeContext';
import { authService } from '../src/core/application/services/authService';

function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const segments = useSegments();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { session } = await authService.getSession();
            setAuthenticated(!!session);
            setLoading(false);
        };
        init();

        const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
            setAuthenticated(!!session);
            if (!session) {
                router.replace('/login');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (loading) return;
        
        const inAuth = segments[0] === 'login';
        
        if (!authenticated && !inAuth) {
            router.replace('/login');
        } else if (authenticated && inAuth) {
            router.replace('/(tabs)/dashboard');
        }
    }, [segments, authenticated, loading]);

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return <>{children}</>;
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <AuthGuard>
                    <Stack screenOptions={{ headerShown: false }} />
                </AuthGuard>
                <StatusBar style="light" />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
});
