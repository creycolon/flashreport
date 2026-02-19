import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Typography } from './Typography';
import { theme } from '@ui/shared/theme';
import { useTheme } from '@ui/shared/theme/ThemeContext';

interface KPICardProps {
    title: string;
    value: string;
    trend?: number;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

export const KPICard = ({ title, value, trend, icon, style }: KPICardProps) => {
    const { colors } = useTheme();
    const isPositive = trend && trend > 0;

    return (
        <Card style={[styles.container, style]}>
            <View style={styles.header}>
                <Typography variant="label">{title}</Typography>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
            </View>
            <View style={styles.content}>
                <Typography variant="h2" weight="bold">{value}</Typography>
                {trend !== undefined && (
                    <View style={[
                        styles.trendBadge,
                        { backgroundColor: isPositive ? colors.success + '20' : colors.danger + '20' }
                    ]}>
                        <Typography
                            variant="caption"
                            color={isPositive ? colors.success : colors.danger}
                            weight="bold"
                        >
                            {isPositive ? '+' : ''}{trend}%
                        </Typography>
                    </View>
                )}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minWidth: 150,
        margin: theme.spacing.xs,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    iconContainer: {
        opacity: 0.8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    trendBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
});
