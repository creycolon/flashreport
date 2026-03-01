import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { Typography, Button } from '@ui/shared/components';
import { useRouter } from 'expo-router';

const SIDEBAR_WIDTH = 256;

interface SidebarItem {
    name: string;
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    badge?: number;
}

interface EnhancedSidebarProps {
    items: SidebarItem[];
    activeRoute?: string;
    onNavigate?: (route: string) => void;
    collapsed?: boolean;
    onNewMovement?: () => void;
    currentPartner?: any;
}

// Default sidebar items based on stitch design
export const DEFAULT_SIDEBAR_ITEMS: SidebarItem[] = [
    { name: 'dashboard', label: 'Dashboard', icon: 'stats-chart' },
    { name: 'list', label: 'Movimientos', icon: 'list' },
    { name: 'add', label: 'Agregar', icon: 'add-circle' },
    { name: 'reports', label: 'Informes', icon: 'analytics' },
    { name: 'profile', label: 'Mi Perfil', icon: 'person' },
    { name: 'settings', label: 'Configuración', icon: 'settings' },
];

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
    items = DEFAULT_SIDEBAR_ITEMS,
    activeRoute,
    onNavigate,
    collapsed = false,
    onNewMovement,
    currentPartner,
}) => {
    const { colors } = useTheme();
    const router = useRouter();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // Rutas que requieren permisos de admin/managing partner
    const RESTRICTED_ROUTES = ['settings', 'partners', 'reports'];
    
    const canAccess = (route: string): boolean => {
        if (!currentPartner) return false;
        const role = (currentPartner.role || '').toLowerCase();
        
        // Admin y Managing Partner tienen acceso total
        if (role === 'admin' || currentPartner.is_managing_partner) return true;
        
        // Usuarios 'base' tienen acceso limitado
        if (role === 'base') {
            // Solo pueden acceder a dashboard, list, add, profile
            const allowedRoutes = ['dashboard', 'list', 'add', 'profile'];
            return allowedRoutes.includes(route);
        }
        
        return true;
    };

    const handleNavigation = (route: string) => {
        if (onNavigate) {
            onNavigate(route);
        } else {
            // Default navigation using expo-router
            if (route === 'dashboard') {
                router.navigate('/(tabs)/dashboard');
            } else if (route === 'list') {
                router.navigate('/(tabs)/list');
            } else if (route === 'reports') {
                router.navigate('/(tabs)/reports');
            } else if (route === 'settings') {
                router.navigate('/(tabs)/settings');
            } else if (route === 'add') {
                router.navigate('/(tabs)/add');
            } else if (route === 'profile') {
                router.navigate('/(tabs)/profile');
            }
        }
    };

    const handleNewMovement = () => {
        if (onNewMovement) {
            onNewMovement();
        } else {
            router.navigate('/(tabs)/add');
        }
    };

    const styles = StyleSheet.create({
        sidebar: {
            width: collapsed ? 72 : SIDEBAR_WIDTH,
            backgroundColor: colors.surface,
            borderRightWidth: 1,
            borderRightColor: colors.border,
            height: '100%',
            flexDirection: 'column',
        },
        sidebarHeader: {
            padding: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        logoContainer: {
            width: collapsed ? 40 : 48,
            height: collapsed ? 40 : 48,
            backgroundColor: colors.primary,
            borderRadius: theme.spacing.borderRadius.md,
            justifyContent: 'center',
            alignItems: 'center',
        },
        logoText: {
            color: colors.cardBackground,
            fontWeight: 'bold',
            fontSize: collapsed ? 16 : 20,
        },
        headerTextContainer: {
            flex: 1,
            opacity: collapsed ? 0 : 1,
        },
        appName: {
            color: colors.text,
            fontWeight: 'bold',
            fontSize: theme.typography.sizes.lg,
            lineHeight: 24,
        },
        appSubtitle: {
            color: colors.primary,
            fontSize: theme.typography.sizes.xs,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginTop: 2,
        },
        sidebarContent: {
            flex: 1,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.sm,
        },
        sidebarItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
            marginVertical: theme.spacing.xs,
            borderRadius: theme.spacing.borderRadius.lg,
            marginHorizontal: collapsed ? theme.spacing.xs : theme.spacing.sm,
            borderLeftWidth: 0,
        },
        sidebarItemActive: {
            backgroundColor: colors.primary + '20', // 20% opacity
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
            paddingLeft: theme.spacing.md - 4, // Adjust for border
        },
        sidebarItemHover: {
            backgroundColor: colors.primary + '10',
        },
        sidebarIcon: {
            width: collapsed ? 24 : 20,
            alignItems: 'center',
            marginRight: collapsed ? 0 : theme.spacing.md,
        },
        sidebarLabel: {
            opacity: collapsed ? 0 : 1,
            flex: 1,
            fontSize: theme.typography.sizes.sm,
        },
        badge: {
            backgroundColor: colors.primary,
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: theme.spacing.sm,
        },
        bottomSection: {
            padding: theme.spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        newMovementButton: {
            borderRadius: theme.spacing.borderRadius.lg,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
            justifyContent: 'center',
            alignItems: 'center',
        },
        helpItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
            marginTop: theme.spacing.md,
            borderRadius: theme.spacing.borderRadius.md,
        },
        // Web hover effects
        ...(Platform.OS === 'web' ? {
            sidebarItemHover: {
                backgroundColor: colors.surfaceLight,
            },
            newMovementButtonHover: {
                backgroundColor: colors.primary + '30',
            },
            helpItemHover: {
                backgroundColor: colors.surfaceLight,
            },
        } : {}),
    });

    return (
        <View style={styles.sidebar}>
            {/* Header with logo */}
            <View style={styles.sidebarHeader}>
                <View style={styles.logoContainer}>
                    <Ionicons name="wallet" size={collapsed ? 20 : 24} color={colors.cardBackground} />
                </View>
                {!collapsed && (
                    <View style={styles.headerTextContainer}>
                        <Typography variant="h3" weight="bold" style={styles.appName}>
                            FlashReport
                        </Typography>
                        <Typography style={styles.appSubtitle}>
                            Admin Dashboard
                        </Typography>
                    </View>
                )}
            </View>

            {/* Navigation Items */}
            <ScrollView style={styles.sidebarContent}>
                {items.map((item) => {
                    const isActive = activeRoute === item.name;
                    const isHovered = hoveredItem === item.name;
                    const hasAccess = canAccess(item.name);
                    return (
                        <TouchableOpacity
                            key={item.name}
                            style={[
                                styles.sidebarItem,
                                isActive && styles.sidebarItemActive,
                                isHovered && !isActive && styles.sidebarItemHover,
                                !hasAccess && { opacity: 0.4 },
                            ]}
                            onPress={() => hasAccess && handleNavigation(item.name)}
                            activeOpacity={hasAccess ? 0.7 : 1}
                            disabled={!hasAccess}
                            {...(Platform.OS === 'web' ? {
                                onMouseEnter: () => hasAccess && setHoveredItem(item.name),
                                onMouseLeave: () => setHoveredItem(null),
                            } : {})}
                        >
                            <View style={styles.sidebarIcon}>
                                <Ionicons
                                    name={item.icon}
                                    size={20}
                                    color={isActive ? colors.primary : colors.textSecondary}
                                />
                            </View>
                            {!collapsed && (
                                <Typography
                                    style={styles.sidebarLabel}
                                    weight={isActive ? 'bold' : 'regular'}
                                    color={isActive ? colors.text : colors.textSecondary}
                                >
                                    {item.label}
                                </Typography>
                            )}
                            {!collapsed && item.badge && item.badge > 0 && (
                                <View style={styles.badge}>
                                    <Typography variant="caption" weight="bold" color={colors.text}>
                                        {item.badge}
                                    </Typography>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
                {/* New Movement Button */}
                <TouchableOpacity
                    style={[
                        styles.newMovementButton,
                        { backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }
                    ]}
                    onPress={handleNewMovement}
                    activeOpacity={0.8}
                >
                    {!collapsed && (
                        <>
                            <Ionicons name="add-circle" size={20} color={colors.cardBackground} style={{ marginRight: 8 }} />
                            <Typography weight="bold" color={colors.cardBackground}>
                                Nuevo Movimiento
                            </Typography>
                        </>
                    )}
                    {collapsed && (
                        <Ionicons name="add-circle" size={20} color={colors.cardBackground} />
                    )}
                </TouchableOpacity>

                {/* Help Center */}
                {!collapsed && (
                    <TouchableOpacity style={styles.helpItem}>
                        <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
                        <Typography
                            style={{ marginLeft: theme.spacing.md, flex: 1 }}
                            color={colors.textSecondary}
                        >
                            Centro de Ayuda
                        </Typography>
                    </TouchableOpacity>
                )}
                {collapsed && (
                    <TouchableOpacity style={{ alignItems: 'center', padding: theme.spacing.md }}>
                        <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};