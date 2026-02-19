import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@ui/shared/theme';
import { useTheme } from '@ui/shared/theme/ThemeContext';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button = ({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) => {
    const { colors } = useTheme();
    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isDanger = variant === 'danger';
    
    const styles = useMemo(() => StyleSheet.create({
        base: {
            height: 50,
            borderRadius: theme.spacing.borderRadius.md,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
        },
        primary: {
            backgroundColor: colors.primary,
        },
        outline: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.primary,
        },
        danger: {
            backgroundColor: colors.danger + '20',
            borderWidth: 1,
            borderColor: colors.danger,
        },
        disabled: {
            backgroundColor: colors.border,
            opacity: 0.7,
        },
        text: {
            color: colors.cardBackground,
            fontSize: theme.typography.sizes.md,
            fontWeight: 'bold',
        },
        textOutline: {
            color: colors.primary,
        },
        textDanger: {
            color: colors.danger,
        },
        textDisabled: {
            color: colors.textMuted,
        },
    }), [colors]);

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.base,
                isPrimary && styles.primary,
                isOutline && styles.outline,
                isDanger && styles.danger,
                (disabled || loading) && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={isOutline ? colors.primary : colors.cardBackground} />
            ) : (
                <Text style={[
                    styles.text,
                    isOutline && styles.textOutline,
                    isDanger && styles.textDanger,
                    (disabled || loading) && styles.textDisabled,
                ]}>
                    {loading ? 'Procesando...' : title}
                </Text>
            )}
        </TouchableOpacity>
    );
};


