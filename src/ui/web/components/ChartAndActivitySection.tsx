import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChartContainerEnhanced } from './ChartContainerEnhanced';
import { ActivityFeedEnhanced, ActivityItem } from './ActivityFeedEnhanced';
import { Typography } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';

export interface ChartData {
    labels: string[];
    series: Array<{
        id: string;
        name: string;
        color: string;
        data: number[];
    }>;
}

export interface FilterOption {
    value: string;
    label: string;
}

export interface ChartAndActivityProps {
    chartTitle: string;
    chartSubtitle?: string;
    periodLabel?: string;
    chartData: ChartData;
    activityTitle: string;
    activityItems: ActivityItem[];
    chartHeight?: number;
    activityMaxHeight?: number;
    filters?: FilterOption[];
    selectedFilter?: string;
    onFilterChange?: (filter: string) => void;
}

export const ChartAndActivitySection: React.FC<ChartAndActivityProps> = ({
    chartTitle,
    chartSubtitle,
    periodLabel,
    chartData,
    activityTitle,
    activityItems,
    chartHeight = 300,
    activityMaxHeight = 400,
    filters = [],
    selectedFilter = '',
    onFilterChange,
}) => {
    const { colors } = useTheme();

    // Generate dynamic subtitle based on selected filter
    const getDynamicSubtitle = () => {
        if (chartSubtitle) return chartSubtitle;
        
        const now = new Date();
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const filterLabels: Record<string, string> = {
            'week': 'Última Semana',
            'month': `Mes de ${monthNames[now.getMonth()]}`,
            'year': `Año ${now.getFullYear()}`,
            '7d': 'Últimos 7 días',
            '30d': 'Últimos 30 días',
            'all': 'Último Año',
        };
        
        return filterLabels[selectedFilter] || ' 7 días';
    };

    return (
        <View style={styles.container}>
            {/* Filters - at the top */}
            {filters.length > 0 && (
                <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
                    {filters.map((filter) => {
                        const isActive = selectedFilter === filter.value;
                        return (
                            <TouchableOpacity
                                key={filter.value}
                                style={[styles.filterButton, isActive && { backgroundColor: colors.primary }]}
                                onPress={() => onFilterChange?.(filter.value)}
                            >
                                <Typography
                                    style={styles.filterButtonText}
                                    color={isActive ? colors.cardBackground : colors.textSecondary}
                                >
                                    {filter.label}
                                </Typography>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* Chart & Activity Row */}
            <View style={styles.contentRow}>
                <View style={styles.chartContainer}>
                    <ChartContainerEnhanced
                        title={chartTitle}
                        subtitle={getDynamicSubtitle()}
                        periodLabel={periodLabel}
                        showPeriodSelector={!!periodLabel}
                        chartData={chartData}
                        height={chartHeight}
                    />
                </View>
                <View style={styles.activityContainer}>
                    <ActivityFeedEnhanced
                        title={activityTitle}
                        items={activityItems}
                        maxHeight={activityMaxHeight}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
        padding: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    filterButtonActive: {
        backgroundColor: '#000',
    },
    filterButtonText: {
        fontSize: theme.typography.sizes.sm,
        fontWeight: '600',
    },
    contentRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    chartContainer: {
        flex: 2,
    },
    activityContainer: {
        flex: 1,
    },
});
