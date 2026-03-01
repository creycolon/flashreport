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
import { ProfileScreen } from '../../../../app/profile';
import { businessUnitRepository } from '../../../core/infrastructure/repositories/businessUnitRepository';
import { categoryRepository } from '../../../core/infrastructure/repositories/categoryRepository';
import { cashMovementRepository } from '../../../core/infrastructure/repositories/cashMovementRepository';
import { partnerRepository } from '../../../core/infrastructure/repositories/partnerRepository';
import { managingPartnerService } from '../../../core/application/services/managingPartnerService';
import { authService } from '../../../core/application/services/authService';
import { hasPermission } from '../../../core/application/services/permissionService';
import { useState, useEffect } from 'react';

export const WebLayoutEnhanced: React.FC<{ children?: React.ReactNode; activeRoute?: string }> = ({ children, activeRoute }) => {
    const router = useRouter();
    const segments = useSegments();
    const { colors } = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    const userAgent = isBrowser ? navigator.userAgent : '';
    const isDesktopBrowser = /Mozilla|Opera|Chrome|Safari|Edge/i.test(userAgent) && !/Mobile|Tablet|Android/i.test(userAgent);
    const isWebDesktop = (Platform.OS === 'web') && (isDesktopBrowser || windowWidth >= 768);

    // AddMovementEnhanced data
    const [businessUnits, setBusinessUnits] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [currentPartnerId, setCurrentPartnerId] = useState<number | null>(null);
    const [currentPartner, setCurrentPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // 1. Primero leer partner guardado en localStorage (del login)
            let savedPartner = null;
            try {
                const savedPartnerStr = localStorage.getItem('currentPartner');
                if (savedPartnerStr) {
                    savedPartner = JSON.parse(savedPartnerStr);
                    console.log('[WebLayout] Partner de localStorage:', savedPartner.id, savedPartner.name);
                }
            } catch (e) {
                console.log('[WebLayout] Error al leer partner de localStorage');
            }

            // 2. Cargar datos en paralelo
            const [bus, cats, partner, allPartners, authPartnerResult] = await Promise.all([
                businessUnitRepository.getAll(),
                categoryRepository.getAll(),
                managingPartnerService.getCurrentManagingPartner(),
                partnerRepository.getAll(),
                authService.getCurrentPartner()
            ]);
            setBusinessUnits(bus || []);
            setCategories(cats || []);
            
            // 3. Determinar partner: auth > localStorage > gerente > primero
            const loggedInPartner = authPartnerResult?.partner;
            let finalPartner = null;
            
            if (loggedInPartner) {
                finalPartner = loggedInPartner;
                // Actualizar localStorage con datos frescos de auth
                localStorage.setItem('currentPartner', JSON.stringify(loggedInPartner));
                console.log('[WebLayout] Partner de auth:', finalPartner.id);
            } else if (savedPartner) {
                finalPartner = savedPartner;
                console.log('[WebLayout] Usando partner de localStorage:', finalPartner.id);
            } else if (partner) {
                finalPartner = partner;
                console.log('[WebLayout] Fallback a socio gerente:', finalPartner.id);
            } else if (allPartners && allPartners.length > 0) {
                finalPartner = allPartners[0];
                console.log(`[WebLayout] Fallback a primer socio: ${finalPartner.name}`);
            }

            if (finalPartner) {
                setCurrentPartner(finalPartner);
                setCurrentPartnerId(finalPartner.id);
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
        console.log('[WebLayoutEnhanced] handleSubmit - movement:', movement);
        await cashMovementRepository.create({
            businessUnitId: movement.businessUnitId,
            type: movement.type,
            categoryId: movement.categoryId,
            amount: movement.amount,
            description: movement.description.trim(),
            date: movement.date.toISOString(),
            createdBy: currentPartnerId || null,
            pointOfSaleId: movement.pointOfSaleId,
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
            case 'profile':
                return (
                    <ProfileScreen 
                        partner={currentPartner}
                        onUpdate={(updated) => setCurrentPartner(updated)}
                    />
                );
            case 'settings':
                return <SettingsScreen />;
            default:
                return <DashboardScreen />;
        }
    };

    const handleLogout = async () => {
        try {
            await authService.signOut();
            router.replace('/login');
        } catch (error) {
            console.error('Error logging out:', error);
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
                currentPartner={currentPartner}
            />
            <View style={styles.main}>
                <WebHeader 
                    user={currentPartner ? {
                        name: currentPartner.name || 'Usuario',
                        role: (currentPartner?.role || '').toLowerCase() === 'admin' ? 'Admin' : 
                               ((currentPartner?.role || '').toLowerCase() === 'base' ? 'Base' :
                               (currentPartner.is_managing_partner ? 'Gerente' : 
                               (currentPartner.is_active ? 'Socio' : 'Inactivo'))),
                        avatar: currentPartner.image || undefined
                    } : undefined}
                    onLogout={handleLogout}
                />
                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                    {renderScreen()}
                </ScrollView>
            </View>
        </View>
    );
};