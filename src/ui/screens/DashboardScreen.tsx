import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { theme } from '../theme';
import { Typography, KPICard, Card, LineChart } from '../components';
import { financialService } from '../../application/services/financialService';
import { configRepository } from '../../infrastructure/repositories/configRepository';
import { formatCurrency, formatNumber } from '../../application/utils/format';
import { useTheme } from '../theme/ThemeContext';

interface MetricData {
    totalSales: number;
    totalTickets: number;
    busCount: number;
}

interface ChartSeries {
    id: string;
    name: string;
    color: string;
    data: number[];
}

interface ChartData {
    labels: string[];
    series: ChartSeries[];
}

export const DashboardScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [allowZoom, setAllowZoom] = useState(true);
    const [selectedDays, setSelectedDays] = useState(7);
    const [metrics, setMetrics] = useState<MetricData>({
        totalSales: 0,
        totalTickets: 0,
        busCount: 0
    });
    const [chartData, setChartData] = useState<ChartData>({
        labels: [],
        series: []
    });

    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const { colors } = useTheme();
    const isLandscape = windowWidth > windowHeight;
    
    const styles = useMemo(() => StyleSheet.create({
        centered: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
        },
        safe: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            flex: 1,
        },
        content: {
            padding: theme.spacing.md,
        },
        header: {
            marginBottom: theme.spacing.md,
        },
        filterContainer: {
            flexDirection: 'row',
            marginBottom: theme.spacing.lg,
            backgroundColor: colors.cardBackground,
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
            backgroundColor: colors.primary,
        },
        kpiRow: {
            flexDirection: 'column',
            marginBottom: 0,
        },
        kpiLine: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 0,
            marginVertical: 0,
        },
        mainChart: {
            height: 380, // increased height for larger chart
            marginBottom: theme.spacing.lg,
        },
        chartHeader: {
            marginBottom: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
        },
        legendScroll: {
            marginTop: 4,
            paddingHorizontal: theme.spacing.md,
        },
        legend: {
            flexDirection: 'row',
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: theme.spacing.sm,
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 4,
        },
        chartPlaceholder: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.md,
        },
        sectionHeader: {
            marginBottom: theme.spacing.sm,
        },
        alertCard: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.md,
        },
        statusIndicator: {
            width: 4,
            height: '100%',
            borderRadius: 2,
            marginRight: theme.spacing.md,
        },
    }), [colors]);

    const fetchData = async (days = 7) => {
        console.log('Dashboard: fetchData started, days:', days);
        setLoading(true);
        try {
            const [globalMetrics, performanceData, zoomPref] = await Promise.all([
                financialService.getGlobalMetrics(days),
                financialService.getChartData(days),
                (configRepository as any).get('chart_dynamic_zoom', 'true')
            ]);
            console.log('Dashboard: fetchData succeeded', {
                metrics: globalMetrics,
                chartDataLength: performanceData?.series?.length || 0,
                zoomPref
            });
             setMetrics(globalMetrics || { totalSales: 0, totalTickets: 0, busCount: 0 });
             setChartData(performanceData || { labels: [], series: [] });
             setAllowZoom(zoomPref === 'true');
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            console.error('Error stack:', (error as Error).stack);
        } finally {
            setLoading(false);
            setRefreshing(false);
            console.log('Dashboard: fetchData completed');
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData(selectedDays);
        }, [selectedDays])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData(selectedDays);
    };

    const handleFilterChange = (days: number) => {
        setSelectedDays(days);
        // fetchData is triggered by useFocusEffect dependency or manual call?
        // useFocusEffect runs on focus, dependency change might trigger re-run if focus is kept.
        // It's safer to call fetchData directly here or let useEffect handle it if we modify dependency array.
        // However, useFocusEffect with dependency array is tricky.
        // Let's call fetchData directly to be sure and update state.
        fetchData(days);
    };

    if (loading && !refreshing && metrics.busCount === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    const getPeriodLabel = () => {
        if (selectedDays === 7) return 'Últimos 7 días';
        if (selectedDays === 30) return 'Últimos 30 días';
        return 'Último Año';
    };

    const chartWidth = windowWidth - theme.spacing.md * 2;

    return (
        <View style={styles.safe}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh}                     tintColor={colors.primary} />
                }
            >
                <View style={styles.header}>
                    <Typography variant="h1">Flash Report</Typography>
                    <Typography variant="body" color={colors.textSecondary}>
                        Resumen Global • {getPeriodLabel()}
                    </Typography>
                </View>

                {/* Filter Controls */}
                <View style={styles.filterContainer}>
                    {[7, 30, 365].map((days) => (
                        <TouchableOpacity
                            key={days}
                            style={[
                                styles.filterButton,
                                selectedDays === days && styles.filterButtonActive
                            ]}
                            onPress={() => handleFilterChange(days)}
                        >
                            <Typography
                                variant="caption"
                                weight="bold"
                                 color={selectedDays === days ? colors.text : colors.textSecondary}
                            >
                                {days === 7 ? 'Semana' : days === 30 ? 'Mes' : 'Anual'}
                            </Typography>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.kpiRow}>
                    <View style={styles.kpiLine}>
                        <Typography variant="label" weight="bold">VENTAS</Typography>
                        <Typography variant="h2" weight="bold" style={{ fontSize: theme.typography.sizes.xl * 0.9 }}>{formatCurrency(metrics.totalSales)}</Typography>
                    </View>
                    <View style={styles.kpiLine}>
                        <Typography variant="label" weight="bold">TICKETS</Typography>
                        <Typography variant="h2" weight="bold" style={{ fontSize: theme.typography.sizes.xl * 0.9 }}>{formatNumber(metrics.totalTickets)}</Typography>
                    </View>
                </View>

                <Card style={[styles.mainChart, { paddingHorizontal: 0 }, isLandscape && { height: 450 }]}>
                    <View style={styles.chartHeader}>
                        <Typography variant="h3">Ingresos</Typography>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendScroll}>
                            <View style={styles.legend}>
                                {chartData.series.map(s => (
                                    <View key={s.id} style={styles.legendItem}>
                                        <View style={[styles.dot, { backgroundColor: s.color }]} />
                                        <Typography variant="caption">{s.name}</Typography>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {chartData.series.length > 0 ? (
                        <LineChart
                            labels={chartData.labels}
                            series={chartData.series}
                            height={isLandscape ? 380 : 240}
                            width={chartWidth}
                            allowZoom={true}
                            interactive={true}
                        />
                    ) : (
                        <View style={styles.chartPlaceholder}>
                            {metrics.busCount === 0 ? (
                                <Typography variant="caption">No hay unidades de negocio registradas</Typography>
                            ) : chartData.series.length === 0 ? (
                                <Typography variant="caption">No hay datos de ventas en el período seleccionado</Typography>
                            ) : (
                                <Typography variant="caption">Cargando histórico...</Typography>
                            )}
                        </View>
                    )}
                </Card>

                <View style={styles.sectionHeader}>
                    <Typography variant="h3">Alertas de Caja</Typography>
                </View>

                {metrics.totalSales < 0 ? (
                    <Card variant="outline" style={styles.alertCard}>
                        <View style={[styles.statusIndicator, { backgroundColor: colors.danger }]} />
                        <View>
                            <Typography variant="body" weight="bold">Saldo Negativo Global</Typography>
                            <Typography variant="caption">Verifica las unidades con déficit</Typography>
                        </View>
                    </Card>
                ) : (
                    <Typography variant="caption" align="center" style={{ marginTop: 10 }}>
                        No hay alertas críticas en este momento
                    </Typography>
                )}
            </ScrollView>
        </View>
    );
};


