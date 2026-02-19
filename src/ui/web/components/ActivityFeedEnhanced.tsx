import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';

export type ActivityType = 'revenue' | 'expense' | 'warning' | 'info' | 'success' | 'error';

export interface ActivityItem {
    id: string;
    title: string;
    description: string;
    amount?: string;
    amountType?: 'positive' | 'negative' | 'neutral';
    time: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    type: ActivityType;
}

export interface ActivityFeedEnhancedProps {
    title: string;
    items: ActivityItem[];
    onViewAll?: () => void;
    maxHeight?: number;
}

const getActivityColors = (type: ActivityType, colors: any) => {
    switch (type) {
        case 'revenue':
        case 'success':
            return {
                background: colors.success + '10',
                icon: colors.success,
                text: colors.success,
            };
        case 'expense':
        case 'error':
            return {
                background: colors.danger + '10',
                icon: colors.danger,
                text: colors.danger,
            };
        case 'warning':
            return {
                background: colors.warning + '10',
                icon: colors.warning,
                text: colors.warning,
            };
        case 'info':
        default:
            return {
                background: colors.info + '10',
                icon: colors.info,
                text: colors.info,
            };
    }
};

const getAmountColor = (type: 'positive' | 'negative' | 'neutral', colors: any) => {
    switch (type) {
        case 'positive':
            return colors.success;
        case 'negative':
            return colors.danger;
        case 'neutral':
        default:
            return colors.textSecondary;
    }
};

export const ActivityFeedEnhanced: React.FC<ActivityFeedEnhancedProps> = ({
    title,
    items,
    onViewAll,
    maxHeight = 350,
}) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.xl,
            padding: theme.spacing.lg,
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
        },
        title: {
            color: colors.text,
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
        },
        viewAllButton: {
            color: colors.primary,
            fontSize: theme.typography.sizes.xs,
            fontWeight: 'bold',
            textTransform: 'uppercase',
        },
        scrollContainer: {
            maxHeight,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            padding: theme.spacing.md,
            marginVertical: theme.spacing.xs,
            borderRadius: theme.spacing.borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceLight + '30',
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        content: {
            flex: 1,
        },
        activityTitle: {
            color: colors.text,
            fontSize: theme.typography.sizes.sm,
            fontWeight: 'bold',
            lineHeight: theme.typography.lineHeights.tight,
        },
        activityDescription: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.xs,
            marginTop: 2,
        },
        amountContainer: {
            alignItems: 'flex-end',
        },
        amount: {
            fontSize: theme.typography.sizes.sm,
            fontWeight: '900',
        },
        time: {
            color: colors.textMuted,
            fontSize: theme.typography.sizes.xs,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginTop: 2,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Typography style={styles.title}>
                    {title}
                </Typography>
                {onViewAll && Platform.OS === 'web' && (
                    <TouchableOpacity onPress={onViewAll}>
                        <Typography style={styles.viewAllButton}>
                            Ver Todo
                        </Typography>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={Platform.OS === 'web'}>
                {items.map((item) => {
                    const activityColors = getActivityColors(item.type, colors);
                    const amountColor = item.amountType ? getAmountColor(item.amountType, colors) : colors.text;
                    
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.activityItem}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: activityColors.background }]}>
                                <Ionicons name={item.icon} size={20} color={activityColors.icon} />
                            </View>
                            <View style={styles.content}>
                                <Typography style={styles.activityTitle}>
                                    {item.title}
                                </Typography>
                                <Typography style={styles.activityDescription}>
                                    {item.description}
                                </Typography>
                            </View>
                            {(item.amount || item.time) && (
                                <View style={styles.amountContainer}>
                                    {item.amount && (
                                        <Typography style={[styles.amount, { color: amountColor }]}>
                                            {item.amount}
                                        </Typography>
                                    )}
                                    <Typography style={styles.time}>
                                        {item.time}
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

// Example usage component
export const ActivityFeedEnhancedExample: React.FC = () => {
    const mockItems: ActivityItem[] = [
        {
            id: '1',
            title: 'Cierre de Caja #12',
            description: 'Terminal A - Cajero: J. Pérez',
            amount: '+$4,250',
            amountType: 'positive',
            time: 'Hace 5 min',
            icon: 'trending-up',
            type: 'revenue',
        },
        {
            id: '2',
            title: 'Retiro de Efectivo',
            description: 'Fondo de maniobra - Admin',
            amount: '-$200',
            amountType: 'negative',
            time: 'Hace 42 min',
            icon: 'trending-down',
            type: 'expense',
        },
        {
            id: '3',
            title: 'Cierre de Caja #09',
            description: 'Terminal C - Cajera: M. Sosa',
            amount: '+$1,890',
            amountType: 'positive',
            time: 'Hace 1h',
            icon: 'trending-up',
            type: 'revenue',
        },
        {
            id: '4',
            title: 'Reinicio de Terminal',
            description: 'Terminal B - Error de red',
            amount: '',
            amountType: 'neutral',
            time: 'Hace 2h',
            icon: 'sync',
            type: 'warning',
        },
        {
            id: '5',
            title: 'Apertura de Caja #05',
            description: 'Terminal D - Cajero: R. Gómez',
            amount: '+$3,150',
            amountType: 'positive',
            time: 'Hace 3h',
            icon: 'trending-up',
            type: 'revenue',
        },
    ];

    return (
        <ActivityFeedEnhanced
            title="Actividad Reciente"
            items={mockItems}
            maxHeight={400}
        />
    );
};