import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { EnhancedSidebar, DEFAULT_SIDEBAR_ITEMS } from './EnhancedSidebar';
import { WebHeader } from './WebHeader';
import { DashboardScreen } from '../../../features/dashboard/DashboardScreen';
import { MovementsListScreen } from '../../../features/movements/MovementsListScreen';
import { AddMovementScreen } from '../../../features/movements/AddMovementScreen';
import { ReportsScreen } from '../../../features/reports/ReportsScreen';
import { SettingsScreen } from '../../../features/settings/SettingsScreen';
import { AddMovementEnhanced } from '../components/AddMovementEnhanced';
import { businessUnitRepository } from '../../../core/infrastructure/repositories/businessUnitRepository';
import { categoryRepository } from '../../../core/infrastructure/repositories/categoryRepository';
import { cashMovementRepository } from '../../../core/infrastructure/repositories/cashMovementRepository';
import { partnerRepository } from '../../../core/infrastructure/repositories/partnerRepository';
import { managingPartnerService } from '../../../core/application/services/managingPartnerService';
import { useState, useEffect } from 'react';

export const WebLayoutEnhanced: React.FC<{ children?: React.ReactNode; activeRoute?: string }> = ({ children, activeRoute }) => {
    const router = useRouter();
    const segments = useSegments();
    const { colors } = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    const isWebDesktop = Platform.OS === 'web' && windowWidth >= 1024;

    // AddMovementEnhanced data
    const [businessUnits, setBusinessUnits] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [currentPartnerId, setCurrentPartnerId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [bus, cats, partner, allPartners] = await Promise.all([
                businessUnitRepository.getAll(),
                categoryRepository.getAll(),
                managingPartnerService.getCurrentManagingPartner(),
                partnerRepository.getAll()
            ]);
            setBusinessUnits(bus || []);
            setCategories(cats || []);

            // Set current partner with fallback
            if (partner) {
                setCurrentPartnerId(partner.id);
            } else if (allPartners && allPartners.length > 0) {
                setCurrentPartnerId(allPartners[0].id);
                console.log(`[WebLayout] No managing partner, fallback to: ${allPartners[0].name}`);
            } else {
                setCurrentPartnerId(null);
            }
        } catch (error) {
            console.error('Error loading data for AddMovementEnhanced:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (movement: any) => {
        await cashMovementRepository.create({
            businessUnitId: movement.businessUnitId,
            type: movement.type,
            categoryId: movement.categoryId,
            amount: movement.amount,
            description: movement.description.trim(),
            date: movement.date.toISOString(),
            createdBy: currentPartnerId || null,
        });
    };

    const currentScreen = activeRoute || segments[segments.length - 1] || 'dashboard';

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

    const renderScreen = () => {
        switch (currentScreen) {
            case 'dashboard':
                return <DashboardScreen />;
            case 'list':
                return <MovementsListScreen />;
            case 'add':
                if (isWebDesktop) {
                    return (
                        <AddMovementEnhanced
                            businessUnits={businessUnits.map(b => ({ id: b.id, name: b.name, color: b.color }))}
                            categories={categories.map(c => ({ id: c.id, name: c.name, type: c.type }))}
                            loading={loading}
                            onSubmit={handleSubmit}
                        />
                    );
                }
                return <AddMovementScreen />;
            case 'reports':
                return <ReportsScreen />;
            case 'settings':
                return <SettingsScreen />;
            default:
                return <DashboardScreen />;
        }
    };

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
                    {renderScreen()}
                </ScrollView>
            </View>
        </View>
    );
};