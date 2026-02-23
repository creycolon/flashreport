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
        checkAuth();
        
        const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
            const isAuth = !!session;
            setAuthenticated(isAuth);
            
            if (!isAuth) {
                router.replace('/login');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!loading) {
            const inAuthGroup = segments[0] === 'login' || segments[0] === 'forgot-password';
            
            if (!authenticated && !inAuthGroup) {
                router.replace('/login');
            } else if (authenticated && inAuthGroup) {
                router.replace('/(tabs)/dashboard');
            }
        }
    }, [segments, authenticated, loading]);

    const checkAuth = async () => {
        try {
            const { session } = await authService.getSession();
            const isAuth = !!session;
            setAuthenticated(isAuth);
            
            const inAuthGroup = segments[0] === 'login' || segments[0] === 'forgot-password';
            
            if (!isAuth && !inAuthGroup) {
                router.replace('/login');
            } else if (isAuth && inAuthGroup) {
                router.replace('/(tabs)/dashboard');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            router.replace('/login');
        } finally {
            setLoading(false);
        }
    };

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
