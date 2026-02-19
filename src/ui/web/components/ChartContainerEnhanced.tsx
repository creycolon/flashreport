import React, { useState } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { LineChart } from '@ui/shared/components';
import { Typography } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';

export interface ChartContainerEnhancedProps {
    title: string;
    subtitle?: string;
    periodOptions?: Array<{ label: string; value: string }>;
    onPeriodChange?: (period: string) => void;
    chartData: {
        labels: string[];
        series: Array<{
            id: string;
            name: string;
            color: string;
            data: number[];
        }>;
    };
    height?: number;
}

const defaultPeriodOptions = [
    { label: 'Últimos 7 días', value: '7days' },
    { label: 'Últimos 30 días', value: '30days' },
    { label: 'Mes actual', value: 'currentMonth' },
];

export const ChartContainerEnhanced: React.FC<ChartContainerEnhancedProps> = ({
    title,
    subtitle,
    periodOptions = defaultPeriodOptions,
    onPeriodChange,
    chartData,
    height = 300,
}) => {
    const { colors } = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0].value);

    const handlePeriodChange = (value: string) => {
        setSelectedPeriod(value);
        if (onPeriodChange) {
            onPeriodChange(value);
        }
    };

    const chartWidth = windowWidth >= 1024 ? windowWidth - 500 : windowWidth - 48;

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
        titleContainer: {
            flex: 1,
        },
        title: {
            color: colors.text,
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
        },
        subtitle: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.xs,
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginTop: theme.spacing.xs,
        },
        periodSelector: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            backgroundColor: colors.surfaceLight,
        },
        periodText: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.xs,
            fontWeight: 'bold',
        },
        chartContainer: {
            flex: 1,
            minHeight: height,
        },
        chartPlaceholder: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.surfaceLight,
            borderRadius: theme.spacing.borderRadius.lg,
        },
        gradientOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
        },
        xAxisLabels: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: theme.spacing.md,
            paddingHorizontal: theme.spacing.sm,
        },
        xAxisLabel: {
            color: colors.textMuted,
            fontSize: theme.typography.sizes.xs,
            fontWeight: 'bold',
            textTransform: 'uppercase',
        },
    });

    // Mock x-axis labels for days of week
    const xAxisLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Typography style={styles.title}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography style={styles.subtitle}>
                            {subtitle}
                        </Typography>
                    )}
                </View>
                {Platform.OS === 'web' && (
                    <View style={styles.periodSelector}>
                        <Typography style={styles.periodText}>
                            {periodOptions.find(opt => opt.value === selectedPeriod)?.label}
                        </Typography>
                    </View>
                )}
            </View>

            <View style={styles.chartContainer}>
                <LineChart
                    labels={chartData.labels}
                    series={chartData.series}
                    height={height}
                    width={chartWidth}
                    interactive={Platform.OS === 'web'}
                />
                
                {/* Custom x-axis labels for web */}
                {Platform.OS === 'web' && chartData.labels.length === 0 && (
                    <View style={styles.xAxisLabels}>
                        {xAxisLabels.map((label, idx) => (
                            <Typography key={idx} style={styles.xAxisLabel}>
                                {label}
                            </Typography>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

// Example usage component
export const ChartContainerEnhancedExample: React.FC = () => {
    const mockChartData = {
        labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
        series: [
            {
                id: 'revenue',
                name: 'Ingresos',
                color: '#38ff14',
                data: [2500, 3200, 2800, 4100, 3900, 5200, 4800],
            },
        ],
    };

    return (
        <ChartContainerEnhanced
            title="Evolución de Ingresos"
            subtitle="Comparativa Semanal"
            chartData={mockChartData}
            height={320}
        />
    );
};