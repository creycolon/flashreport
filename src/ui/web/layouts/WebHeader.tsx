import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { Typography } from '@ui/shared/components';

const HEADER_HEIGHT = 64;

interface WebHeaderProps {
    onSearch?: (query: string) => void;
    title?: string;
    user?: {
        name: string;
        role: string;
        avatar?: string;
    };
    notificationsCount?: number;
    onLogout?: () => void;
}

export const WebHeader: React.FC<WebHeaderProps> = ({
    onSearch,
    title = 'Flash Report Dashboard',
    user,
    notificationsCount = 0,
    onLogout,
}) => {
    const { colors, themePreference, setThemePreference, effectiveColorScheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (onSearch) {
            onSearch(text);
        }
    };

    const toggleTheme = () => {
        const newPreference = themePreference === 'dark' ? 'light' : 'dark';
        setThemePreference(newPreference);
    };

    const styles = StyleSheet.create({
        header: {
            height: HEADER_HEIGHT,
            backgroundColor: colors.surface + 'CC', // 80% opacity
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingHorizontal: theme.spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 40,
            // Backdrop blur for web
            ...(Platform.OS === 'web' ? {
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
            } : {}),
        },
        searchContainer: {
            flex: 1,
            maxWidth: 600,
            flexDirection: 'row',
            alignItems: 'center',
        },
        searchWrapper: {
            flex: 1,
            position: 'relative',
        },
        searchIcon: {
            position: 'absolute',
            left: 12,
            top: '50%',
            marginTop: -10, // Half of icon height (20/2)
            zIndex: 1,
        },
        searchInput: {
            width: '100%',
            backgroundColor: colors.surfaceLight,
            borderWidth: 1,
            borderColor: isSearchFocused ? colors.primary : colors.border,
            borderRadius: theme.spacing.borderRadius.lg,
            paddingVertical: theme.spacing.sm,
            paddingLeft: 40,
            paddingRight: theme.spacing.md,
            color: colors.text,
            fontSize: theme.typography.sizes.sm,
        },
        searchPlaceholder: {
            color: colors.textMuted,
        },
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
        },
        iconButton: {
            width: 40,
            height: 40,
            borderRadius: theme.spacing.borderRadius.md,
            backgroundColor: colors.surfaceLight,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
        },
        notificationBadge: {
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            backgroundColor: colors.danger,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: colors.surface,
        },
        separator: {
            height: 32,
            width: 1,
            backgroundColor: colors.border,
            marginHorizontal: theme.spacing.sm,
        },
        userProfile: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            padding: theme.spacing.sm,
            borderRadius: theme.spacing.borderRadius.md,
            cursor: 'pointer',
        },
        userInfo: {
            alignItems: 'flex-end',
            display: Platform.OS === 'web' ? 'flex' : 'none',
        },
        userName: {
            color: colors.text,
            fontSize: theme.typography.sizes.sm,
            fontWeight: 'bold',
            lineHeight: 18,
        },
        userRole: {
            color: colors.textMuted,
            fontSize: theme.typography.sizes.xs,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.3,
            lineHeight: 14,
        },
        userAvatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surfaceLight,
            borderWidth: 2,
            borderColor: colors.border,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarImage: {
            width: '100%',
            height: '100%',
        },
        avatarFallback: {
            color: colors.primary,
            fontWeight: 'bold',
            fontSize: theme.typography.sizes.md,
        },
        // Web hover effects
        ...(Platform.OS === 'web' ? {
            iconButtonHover: {
                backgroundColor: colors.primary + '20',
            },
            userProfileHover: {
                backgroundColor: colors.surfaceLight,
            },
            searchInputHover: {
                borderColor: colors.primary,
            },
        } : {}),
    });

    // Get user initials for fallback avatar
    const getUserInitials = () => {
        const name = user?.name || 'Usuario';
        return name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <View style={styles.header}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <View style={styles.searchIcon}>
                        <Ionicons name="search" size={20} color={colors.textMuted} />
                    </View>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar movimientos, cajas o reportes..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        returnKeyType="search"
                    />
                </View>
            </View>

            {/* Right side: Theme toggle, notifications, user profile */}
            <View style={styles.headerRight}>
                {/* Theme Toggle */}
                <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
                    <Ionicons
                        name={effectiveColorScheme === 'dark' ? 'sunny' : 'moon'}
                        size={20}
                        color={colors.text}
                    />
                </TouchableOpacity>

                {/* Notifications */}
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="notifications-outline" size={20} color={colors.text} />
                    {notificationsCount > 0 && <View style={styles.notificationBadge} />}
                </TouchableOpacity>

                <View style={styles.separator} />

                {/* User Profile */}
                <TouchableOpacity 
                    style={styles.userProfile}
                    onPress={onLogout}
                >
                    <View style={styles.userInfo}>
                        <Typography style={styles.userName}>
                            {user?.name || 'Usuario'}
                        </Typography>
                        <Typography style={styles.userRole}>
                            {user?.role || 'Socio'}
                        </Typography>
                    </View>
                    <View style={styles.userAvatar}>
                         {user?.avatar ? (
                            <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <Typography style={styles.avatarFallback}>
                                {getUserInitials()}
                            </Typography>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};