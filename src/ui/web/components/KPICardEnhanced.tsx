import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { Typography } from '@ui/shared/components';

export type KPITrendType = 'positive' | 'negative' | 'neutral' | 'critical' | 'active';

export interface KPICardEnhancedProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    trend?: {
        value: string;
        type: KPITrendType;
    };
    status?: {
        label: string;
        type: KPITrendType;
    };
    onPress?: () => void;
}

const getTrendColors = (type: KPITrendType, colors: any) => {
    switch (type) {
        case 'positive':
            return {
                background: colors.success + '20',
                text: colors.success,
                icon: colors.success,
            };
        case 'negative':
            return {
                background: colors.danger + '20',
                text: colors.danger,
                icon: colors.danger,
            };
        case 'critical':
            return {
                background: colors.danger + '20',
                text: colors.danger,
                icon: colors.danger,
            };
        case 'active':
            return {
                background: colors.success + '20',
                text: colors.success,
                icon: colors.success,
            };
        case 'neutral':
        default:
            return {
                background: colors.warning + '20',
                text: colors.warning,
                icon: colors.warning,
            };
    }
};

export const KPICardEnhanced: React.FC<KPICardEnhancedProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    status,
    onPress,
}) => {
    const { colors } = useTheme();
    
    const trendColors = trend ? getTrendColors(trend.type, colors) : undefined;
    const statusColors = status ? getTrendColors(status.type, colors) : undefined;
    
    const Container = onPress ? TouchableOpacity : View;
    
    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.xl,
            padding: theme.spacing.lg,
            flex: 1,
            minWidth: 200,
            minHeight: 160,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.md,
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: theme.spacing.borderRadius.md,
            backgroundColor: colors.primary + '10',
            justifyContent: 'center',
            alignItems: 'center',
        },
        trendBadge: {
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.spacing.borderRadius.full,
            backgroundColor: trendColors?.background,
        },
        statusBadge: {
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.spacing.borderRadius.full,
            backgroundColor: statusColors?.background,
        },
        title: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.sm,
            fontWeight: '500',
            marginBottom: theme.spacing.sm,
        },
        value: {
            color: colors.text,
            fontSize: theme.typography.sizes.xl,
            fontWeight: '900',
            lineHeight: 1.2,
            marginBottom: theme.spacing.md,
        },
        subtitle: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.sm,
            fontWeight: '500',
        },
    });
    
    const webStyles = Platform.OS === 'web' ? {
        containerHover: {
            borderColor: colors.primary + '80',
        }
    } : {};
    
    return (
        <Container
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                {trend && (
                    <View style={styles.trendBadge}>
                        <Typography
                            variant="caption"
                            weight="bold"
                            color={trendColors?.text}
                        >
                            {trend.value}
                        </Typography>
                    </View>
                )}
                {!trend && status && (
                    <View style={styles.statusBadge}>
                        <Typography
                            variant="caption"
                            weight="bold"
                            color={statusColors?.text}
                        >
                            {status.label}
                        </Typography>
                    </View>
                )}
            </View>
            
            <Typography style={styles.title}>
                {title}
            </Typography>
            
            <Typography style={styles.value}>
                {value}
            </Typography>
            
            {subtitle && (
                <Typography style={styles.subtitle}>
                    {subtitle}
                </Typography>
            )}
        </Container>
    );
};

// Example usage component for easy testing
export const KPICardEnhancedExamples: React.FC = () => {
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            <KPICardEnhanced
                title="Total Recaudado"
                value="$45,280.00"
                subtitle="VS. AYER: $40,210.00"
                icon="cash"
                trend={{ value: '+12.5%', type: 'positive' }}
            />
            <KPICardEnhanced
                title="Total Tickets"
                value="1,248"
                subtitle="VS. AYER: 1,277"
                icon="receipt"
                trend={{ value: '-2.3%', type: 'negative' }}
            />
            <KPICardEnhanced
                title="Cajas Abiertas"
                value="8 / 12"
                subtitle="4 CAJAS EN CIERRE"
                icon="cart"
                status={{ label: 'Activas', type: 'active' }}
            />
            <KPICardEnhanced
                title="Diferencia de Caja"
                value="-$125.50"
                subtitle="PENDIENTE DE REVISIÓN"
                icon="scale"
                status={{ label: 'Crítico', type: 'critical' }}
            />
        </View>
    );
};