import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { EnhancedSidebar, DEFAULT_SIDEBAR_ITEMS } from './EnhancedSidebar';
import { WebHeader } from './WebHeader';

export const WebLayoutEnhanced: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    console.error('🔴 WEB LAYOUT ENHANCED: Component rendering');
    const router = useRouter();
    const segments = useSegments();
    const { colors } = useTheme();
    console.error('🔴 WEB LAYOUT ENHANCED: colors', colors ? 'defined' : 'undefined');

    const currentScreen = segments[segments.length - 1] || 'index';

    const handleNavigation = (screenName: string) => {
        console.log('[WebLayoutEnhanced] handleNavigation called', { screenName, currentScreen });
        if (currentScreen === screenName) {
            console.log('[WebLayoutEnhanced] Already on same screen, skipping navigation');
            return; // Already on this screen
        }
        console.log('[WebLayoutEnhanced] Navigating to:', `/(tabs)/${screenName}`);
        router.navigate(`/(tabs)/${screenName}`);
    };

    const handleNewMovement = () => {
        router.navigate('/(tabs)/add');
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'row',
            backgroundColor: colors.background,
            height: '100%',
        },
        main: {
            flex: 1,
            height: '100%',
            overflow: 'hidden',
        },
        content: {
            flex: 1,
            padding: theme.spacing.xl,
            overflow: 'scroll',
            backgroundColor: colors.background,
        },
        scrollContent: {
            minHeight: '100%',
        },
    });

    return (
        <View style={styles.container}>
            <EnhancedSidebar
                items={DEFAULT_SIDEBAR_ITEMS}
                activeRoute={currentScreen}
                onNavigate={handleNavigation}
                collapsed={false}
                onNewMovement={handleNewMovement}
            />
            <View style={styles.main}>
                <WebHeader />
                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                    {children}
                </ScrollView>
            </View>
        </View>
    );
};