import React, { useMemo } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '@ui/shared/theme';
import { useTheme } from '@ui/shared/theme/ThemeContext';

interface CardProps extends ViewProps {
    children: React.ReactNode;
    variant?: 'default' | 'flat' | 'outline';
}

export const Card = ({ children, style, variant = 'default', ...props }: CardProps) => {
    const { colors } = useTheme();
    
    const styles = useMemo(() => StyleSheet.create({
        base: {
            backgroundColor: colors.cardBackground,
            borderRadius: theme.spacing.borderRadius.lg,
            padding: theme.spacing.md,
        },
        default: {
            ...theme.spacing.shadows.md,
        },
        outline: {
            borderWidth: 1,
            borderColor: colors.border,
        },
    }), [colors]);
    
    const cardStyle = [
        styles.base,
        variant === 'default' && styles.default,
        variant === 'outline' && styles.outline,
        style,
    ];

    return (
        <View style={cardStyle} {...props}>
            {children}
        </View>
    );
};


