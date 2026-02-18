import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { theme } from '../theme';
import { Typography } from '../components';

const SIDEBAR_WIDTH = 240;

interface SidebarItem {
    name: string;
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    badge?: number;
}

interface SidebarProps {
    items: SidebarItem[];
    activeRoute?: string;
    onNavigate: (route: string) => void;
    collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
    items,
    activeRoute,
    onNavigate,
    collapsed = false,
}) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        sidebar: {
            width: collapsed ? 60 : SIDEBAR_WIDTH,
            backgroundColor: colors.surface,
            borderRightWidth: 1,
            borderRightColor: colors.border,
            height: '100%',
        },
        sidebarHeader: {
            height: 64,
            paddingHorizontal: theme.spacing.md,
            justifyContent: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        sidebarContent: {
            paddingVertical: theme.spacing.md,
        },
        sidebarItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            marginHorizontal: theme.spacing.md,
            marginVertical: theme.spacing.xs,
            borderRadius: theme.spacing.borderRadius.md,
        },
        sidebarItemActive: {
            backgroundColor: colors.primary + '20', // 20% opacity
        },
        sidebarIcon: {
            width: 24,
            alignItems: 'center',
            marginRight: collapsed ? 0 : theme.spacing.md,
        },
        sidebarLabel: {
            opacity: collapsed ? 0 : 1,
            flex: 1,
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
        // Web hover effects
        ...(Platform.OS === 'web' ? {
            sidebarItemHover: {
                backgroundColor: colors.surfaceLight,
            },
        } : {}),
    });

    return (
        <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
                {!collapsed && (
                    <Typography variant="h2" weight="bold" style={{ color: colors.primary }}>
                        FlashReport
                    </Typography>
                )}
                {collapsed && (
                    <View style={{ alignItems: 'center' }}>
                        <Typography variant="h3" weight="bold" style={{ color: colors.primary }}>
                            F
                        </Typography>
                    </View>
                )}
            </View>
            <ScrollView style={styles.sidebarContent}>
                {items.map((item) => {
                    const isActive = activeRoute === item.name;
                    return (
                        <TouchableOpacity
                            key={item.name}
                            style={[
                                styles.sidebarItem,
                                isActive && styles.sidebarItemActive,
                            ]}
                            onPress={() => onNavigate(item.name)}
                            activeOpacity={0.7}
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
                                    variant="body"
                                    weight={isActive ? 'bold' : 'regular'}
                                    color={isActive ? colors.primary : colors.text}
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
        </View>
    );
};