import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { theme } from '@ui/shared/theme';
import { Typography, KPICard, Card, LineChart } from '@ui/shared/components';
import { KPICardEnhanced, ChartContainerEnhanced, ActivityFeedEnhanced, ActivityItem } from '@ui/web/components';
import { financialService } from '@core/application/services/financialService';
import { configRepository } from '@core/infrastructure/repositories/configRepository';
import { formatCurrency, formatNumber } from '@core/application/utils/format';
import { useTheme } from '@ui/shared/theme/ThemeContext';

interface MetricData {
    totalSales: number;
    totalTickets: number;
    busCount: number;
    boxesOpen: number;
    boxesClosed: number;
    cashDifference: number;
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
    const [periodType, setPeriodType] = useState<'week' | 'month' | 'year'>('week');

    // Calculate days for each period type dynamically
    const getDaysForPeriod = (type: 'week' | 'month' | 'year'): number => {
        const now = new Date();
        if (type === 'week') return 7;
        if (type === 'month') {
            return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        }
        return 365;
    };
    
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [resetTimer, setResetTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [metrics, setMetrics] = useState<MetricData>({
        totalSales: 0,
        totalTickets: 0,
        busCount: 0,
        boxesOpen: 0,
        boxesClosed: 0,
        cashDifference: 0
    });
    const [chartData, setChartData] = useState<ChartData>({
        labels: [],
        series: []
    });
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const { colors } = useTheme();
    const isLandscape = windowWidth > windowHeight;
    const isWebDesktop = Platform.OS === 'web' && windowWidth >= 1024;
    
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

    const fetchData = async (days = 7, filterDate?: string) => {
        console.log('Dashboard: fetchData started, days:', days, 'filterDate:', filterDate);
        setLoading(true);
        try {
            const metricsPromise = filterDate 
                ? financialService.getGlobalMetricsByDate(filterDate)
                : financialService.getGlobalMetrics(days);
            const chartPromise = days > 1 || filterDate
                ? financialService.getChartData(filterDate ? 1 : days)
                : financialService.getChartData(1);
            const boxPromise = filterDate
                ? financialService.getBoxStatusByDate(filterDate)
                : financialService.getBoxStatus();
            const activitiesPromise = (financialService.getRecentMovements as any)(10, filterDate || null);
            
            const [globalMetrics, performanceData, zoomPref, boxStatus, recentActivities] = await Promise.all([
                metricsPromise,
                chartPromise,
                (configRepository as any).get('chart_dynamic_zoom', 'true'),
                boxPromise,
                activitiesPromise
            ]);
            console.log('Dashboard: fetchData succeeded', {
                metrics: globalMetrics,
                chartDataLength: performanceData?.series?.length || 0,
                zoomPref,
                boxStatus,
                recentActivitiesCount: recentActivities?.length || 0,
                filterDate
            });
            setMetrics({
                ...(globalMetrics || { totalSales: 0, totalTickets: 0, busCount: 0, cashDifference: 0 }),
                boxesOpen: boxStatus?.open || 0,
                boxesClosed: boxStatus?.closed || 0
            });
            setChartData(performanceData || { labels: [], series: [] });
            setAllowZoom(zoomPref === 'true');
            
            // Set real activities if available
            if (recentActivities && recentActivities.length > 0) {
                setRecentActivities(recentActivities);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            console.error('Error stack:', (error as any).stack);
        } finally {
            setLoading(false);
            setRefreshing(false);
            console.log('Dashboard: fetchData completed');
        }
    };

    const handlePointSelect = (point: { index: number; values: Record<string, number> }) => {
        // Clear existing timer
        if (resetTimer) {
            clearTimeout(resetTimer);
        }
        
        // Get the date from the chart data
        const dateIndex = point.index;
        const dateLabels = chartData.labels;
        if (dateIndex >= 0 && dateIndex < dateLabels.length) {
            const selectedLabel = dateLabels[dateIndex];
            console.log('Dashboard: Point selected:', selectedLabel, 'index:', dateIndex);
            
            // Calculate actual date based on selectedDays and index
            const today = new Date();
            const selectedDateCalc = new Date(today);
            selectedDateCalc.setDate(today.getDate() - (selectedDays - 1 - dateIndex));
            const dateStr = selectedDateCalc.toISOString().split('T')[0];
            
            setSelectedDate(dateStr);
            fetchData(selectedDays, dateStr);
            
            // Set timer to reset to latest day after 30 seconds
            const timer = setTimeout(() => {
                console.log('Dashboard: Auto-resetting to latest day');
                setSelectedDate(null);
                fetchData(selectedDays);
            }, 30000);
            
            setResetTimer(timer);
        }
    };

    const resetToLatest = () => {
        if (resetTimer) {
            clearTimeout(resetTimer);
        }
        setSelectedDate(null);
        fetchData(selectedDays);
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
        let newPeriodType: 'week' | 'month' | 'year';
        if (days === 7) newPeriodType = 'week';
        else if (days <= 31) newPeriodType = 'month';
        else newPeriodType = 'year';
        
        setSelectedDays(days);
        setPeriodType(newPeriodType);
        fetchData(days);
    };

    if (loading && !refreshing && metrics.busCount === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    // Mock data for web dashboard
    const mockActivities: ActivityItem[] = [
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
    ];

    const getPeriodLabel = () => {
        const now = new Date();
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        if (periodType === 'week') return 'Última Semana';
        if (periodType === 'month') return `Mes de ${monthNames[now.getMonth()]}`;
        return `Año ${now.getFullYear()}`;
    };

    // Enhanced dashboard for web desktop
    if (isWebDesktop) {
        const kpiData = [
            {
                title: 'Total Recaudado',
                value: formatCurrency(metrics.totalSales),
                subtitle: `VS. AYER: ${formatCurrency(metrics.totalSales * 0.9)}`,
                icon: 'cash' as const,
                trend: metrics.totalSales > 0 ? { value: '+12.5%', type: 'positive' as const } : undefined,
            },
            {
                title: 'Total Tickets',
                value: formatNumber(metrics.totalTickets),
                subtitle: `VS. AYER: ${formatNumber(metrics.totalTickets * 0.95)}`,
                icon: 'receipt' as const,
                trend: metrics.totalTickets > 0 ? { value: '-2.3%', type: 'negative' as const } : undefined,
            },
            {
                title: 'Cajas Abiertas',
                value: `${metrics.boxesOpen} / ${metrics.busCount}`,
                subtitle: metrics.boxesClosed > 0 ? `${metrics.boxesClosed} CAJAS SIN MOVIMIENTO HOY` : 'TODAS LAS CAJAS ACTIVAS',
                icon: 'cart' as const,
                status: metrics.boxesClosed > 0 ? { label: 'Atención', type: 'critical' as const } : { label: 'Activas', type: 'active' as const },
            },
            {
                title: 'Diferencia de Caja',
                value: formatCurrency(metrics.cashDifference),
                subtitle: metrics.cashDifference === 0 ? 'BALANCE OK' : (metrics.cashDifference < 0 ? 'GASTOS MAYORES A INGRESOS' : 'EXCEDENTE'),
                icon: 'scale' as const,
                status: metrics.cashDifference === 0 
                    ? { label: 'OK', type: 'active' as const }
                    : metrics.cashDifference < 0 
                        ? { label: 'Gastos', type: 'warning' as const }
                        : { label: 'Excedente', type: 'positive' as const },
            },
        ];

        const chartSeries = chartData.series.length > 0 ? chartData.series : [
            {
                id: 'revenue',
                name: 'Ingresos',
                color: colors.primary,
                data: [2500, 3200, 2800, 4100, 3900, 5200, 4800],
            },
        ];

        const chartLabels = chartData.labels.length > 0 ? chartData.labels : ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <ScrollView contentContainerStyle={{ padding: theme.spacing.lg }}>
                    {/* KPI Grid */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
                        {kpiData.map((kpi, idx) => (
                            <View key={idx} style={{ flex: 1, minWidth: 200 }}>
                                <KPICardEnhanced
                                    title={kpi.title}
                                    value={kpi.value}
                                    subtitle={kpi.subtitle}
                                    icon={kpi.icon}
                                    trend={kpi.trend}
                                    status={kpi.status}
                                />
                            </View>
                        ))}
                    </View>

                    {/* Filter Controls */}
                    <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
                        {[
                            { days: 7, label: 'Semana', type: 'week' as const },
                            { days: getDaysForPeriod('month'), label: 'Mes', type: 'month' as const },
                            { days: getDaysForPeriod('year'), label: 'Año', type: 'year' as const }
                        ].map((filter) => (
                            <TouchableOpacity
                                key={filter.type}
                                style={{
                                    paddingHorizontal: theme.spacing.lg,
                                    paddingVertical: theme.spacing.sm,
                                    borderRadius: theme.spacing.borderRadius.md,
                                    backgroundColor: periodType === filter.type ? colors.primary : colors.surface,
                                    borderWidth: 1,
                                    borderColor: periodType === filter.type ? colors.primary : colors.border,
                                }}
                                onPress={() => handleFilterChange(filter.days)}
                            >
                                <Typography
                                    variant="caption"
                                    weight="bold"
                                    color={periodType === filter.type ? colors.cardBackground : colors.text}
                                >
                                    {filter.label}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                            {getPeriodLabel()}
                        </Typography>
                    </View>

                    {/* Chart & Activity Grid */}
                    <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
                        <View style={{ flex: 2 }}>
                            <ChartContainerEnhanced
                                title="Evolución de Ingresos"
                                subtitle={getPeriodLabel()}
                                periodLabel={getPeriodLabel()}
                                chartData={{
                                    labels: chartLabels,
                                    series: chartSeries,
                                }}
                                height={320}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ActivityFeedEnhanced
                                title="Actividad Reciente"
                                items={recentActivities.length > 0 ? recentActivities : mockActivities}
                                maxHeight={400}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }

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
                    {[
                        { days: 7, label: 'Semana', type: 'week' as const },
                        { days: getDaysForPeriod('month'), label: 'Mes', type: 'month' as const },
                        { days: getDaysForPeriod('year'), label: 'Año', type: 'year' as const }
                    ].map((filter) => (
                        <TouchableOpacity
                            key={filter.type}
                            style={[
                                styles.filterButton,
                                periodType === filter.type && styles.filterButtonActive
                            ]}
                            onPress={() => handleFilterChange(filter.days)}
                        >
                            <Typography
                                variant="caption"
                                weight="bold"
                                color={periodType === filter.type ? colors.text : colors.textSecondary}
                            >
                                {filter.label}
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
                        <View style={{ flex: 1 }}>
                            <Typography variant="h3">Ingresos</Typography>
                            {selectedDate && (
                                <TouchableOpacity onPress={resetToLatest}>
                                    <Typography variant="caption" color={colors.primary}>
                                        📅 {selectedDate} (toca para volver a hoy)
                                    </Typography>
                                </TouchableOpacity>
                            )}
                        </View>
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
                            onPointSelect={handlePointSelect}
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


