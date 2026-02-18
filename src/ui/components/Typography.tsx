import React, { useMemo } from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { theme } from '../theme';
import { useTheme } from '../theme/ThemeContext';

interface TypographyProps extends TextProps {
    children: React.ReactNode;
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
    color?: string;
    align?: 'left' | 'center' | 'right';
    weight?: keyof typeof theme.typography.fonts;
}

export const Typography = ({
    children,
    style,
    variant = 'body',
    color,
    align = 'left',
    weight,
    ...props
}: TypographyProps) => {
    const { colors } = useTheme();
    const defaultColor = color || colors.text;
    
    const styles = useMemo(() => StyleSheet.create({
        base: {
            color: colors.text,
        },
        h1: {
            fontSize: theme.typography.sizes.xxl,
            fontWeight: 'bold',
        },
        h2: {
            fontSize: theme.typography.sizes.xl,
            fontWeight: 'bold',
        },
        h3: {
            fontSize: theme.typography.sizes.lg,
            fontWeight: '600',
        },
        body: {
            fontSize: theme.typography.sizes.md,
        },
        caption: {
            fontSize: theme.typography.sizes.xs,
            color: colors.textSecondary,
        },
        label: {
            fontSize: theme.typography.sizes.sm,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: colors.textSecondary,
        },
    }), [colors]);
    
    const textStyle = [
        styles.base,
        styles[variant],
        { color: defaultColor, textAlign: align },
        weight && { fontFamily: theme.typography.fonts[weight] },
        style,
    ];

    return (
        <Text style={textStyle} {...props}>
            {children}
        </Text>
    );
};
