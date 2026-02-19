import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { Typography } from '@ui/shared/components';

const HEADER_HEIGHT = 64;

interface HeaderProps {
    title?: string;
    onMenuPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Flash Report Dashboard', onMenuPress }) => {
    const { colors, themePreference, setThemePreference, effectiveColorScheme } = useTheme();

    const toggleTheme = () => {
        const newPreference = themePreference === 'dark' ? 'light' : 'dark';
        setThemePreference(newPreference);
    };

    const styles = StyleSheet.create({
        header: {
            height: HEADER_HEIGHT,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingHorizontal: theme.spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
        },
        logo: {
            fontSize: theme.typography.sizes.xl,
            fontWeight: 'bold',
            color: colors.primary,
        },
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
        },
        iconButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surfaceLight,
            justifyContent: 'center',
            alignItems: 'center',
        },
        userAvatar: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        // Web-specific hover effects
        ...(Platform.OS === 'web' ? {
            iconButtonHover: {
                backgroundColor: colors.primary + '20',
            },
        } : {}),
    });

    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                {onMenuPress && (
                    <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
                        <Ionicons name="menu" size={24} color={colors.text} />
                    </TouchableOpacity>
                )}
                <Typography variant="h3">{title}</Typography>
            </View>
            <View style={styles.headerRight}>
                <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
                    <Ionicons
                        name={effectiveColorScheme === 'dark' ? 'sunny' : 'moon'}
                        size={20}
                        color={colors.text}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="notifications-outline" size={20} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.userAvatar}>
                    <Typography variant="caption" weight="bold" color={colors.text}>
                        AU
                    </Typography>
                </View>
            </View>
        </View>
    );
};