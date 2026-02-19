import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

// Based on TAB_CONFIG from tabs layout
const SIDEBAR_ITEMS = [
    { name: 'index', label: 'Resumen', icon: 'stats-chart' as const },
    { name: 'list', label: 'Historial', icon: 'list' as const },
    { name: 'add', label: 'Agregar', icon: 'add-circle' as const },
    { name: 'reports', label: 'Reportes', icon: 'document-text' as const },
    { name: 'settings', label: 'Ajustes', icon: 'settings-outline' as const },
];

export const WebLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const segments = useSegments();

    const currentScreen = segments[segments.length - 1] || 'index';

    const handleNavigation = (screenName: string) => {
        router.navigate(`/(tabs)/${screenName}`);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'row',
        },
        main: {
            flex: 1,
            height: '100%',
        },
        content: {
            flex: 1,
            padding: 24,
            overflow: 'scroll',
        },
    });

    return (
        <View style={styles.container}>
            <Sidebar
                items={SIDEBAR_ITEMS}
                activeRoute={currentScreen}
                onNavigate={handleNavigation}
                collapsed={false}
            />
            <View style={styles.main}>
                <Header />
                <View style={styles.content}>
                    {children}
                </View>
            </View>
        </View>
    );
};