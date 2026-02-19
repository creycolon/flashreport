import React, { useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { theme } from '@ui/shared/theme';
import { useTheme } from '@ui/shared/theme/ThemeContext';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export const Input = ({ label, error, containerStyle, ...props }: InputProps) => {
    const { colors } = useTheme();
    console.log('[Input] colors:', { text: colors.text, background: colors.background, surface: colors.surface });
    
    const styles = useMemo(() => StyleSheet.create({
        container: {
            marginBottom: theme.spacing.md,
        },
        label: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.sm,
            marginBottom: theme.spacing.xs,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        input: {
            height: 50,
            backgroundColor: colors.surface,
            borderRadius: theme.spacing.borderRadius.md,
            paddingHorizontal: theme.spacing.md,
            color: colors.text,
            fontSize: theme.typography.sizes.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        inputError: {
            borderColor: colors.danger,
        },
        errorText: {
            color: colors.danger,
            fontSize: theme.typography.sizes.xs,
            marginTop: 4,
        },
    }), [colors]);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
             <TextInput
                 style={[styles.input, error ? styles.inputError : null, props.style]}
                 placeholderTextColor={colors.textMuted}
                 {...props}
             />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};


