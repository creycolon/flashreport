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
        console.log('[AuthGuard] checkAuth starting...');
        try {
            console.log('[AuthGuard] calling getSession...');
            const { session, error } = await authService.getSession();
            console.log('[AuthGuard] session result:', { hasSession: !!session, error });
            
            const isAuth = !!session;
            setAuthenticated(isAuth);
            
            const inAuthGroup = segments[0] === 'login' || segments[0] === 'forgot-password';
            console.log('[AuthGuard] isAuth:', isAuth, 'inAuthGroup:', inAuthGroup, 'segments:', segments);
            
            if (!isAuth && !inAuthGroup) {
                console.log('[AuthGuard] Redirecting to /login');
                router.replace('/login');
            } else if (isAuth && inAuthGroup) {
                console.log('[AuthGuard] Redirecting to /dashboard');
                router.replace('/(tabs)/dashboard');
            } else {
                console.log('[AuthGuard] No redirect needed');
            }
        } catch (error) {
            console.error('[AuthGuard] Error:', error);
            router.replace('/login');
        } finally {
            console.log('[AuthGuard] checkAuth finished, setting loading=false');
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
