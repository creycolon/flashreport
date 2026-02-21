import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Card, Button } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { ChartAndActivitySection } from './ChartAndActivitySection';
import { ActivityItem } from './ActivityFeedEnhanced';

export interface Report {
    id: string;
    title: string;
    description: string;
    date: Date;
    type: 'sales' | 'inventory' | 'financial' | 'audit';
    size?: string;
    downloadUrl?: string;
    businessUnitId?: string;
}

export interface BusinessUnitOption {
    id: string;
    name: string;
    color: string;
}

export interface ReportsEnhancedProps {
    businessUnits?: BusinessUnitOption[];
    selectedBu?: string;
    onSelectBu?: (buId: string) => void;
    dateFilter?: string;
    onDateFilterChange?: (filter: string) => void;
    reports?: Report[];
    onGenerateReport?: (type: string) => void;
    onExportReport?: (report: Report) => void;
    onViewAuditLog?: () => void;
}

export const ReportsEnhanced: React.FC<ReportsEnhancedProps> = ({
    businessUnits = [],
    selectedBu = 'all',
    onSelectBu,
    dateFilter = '7d',
    onDateFilterChange,
    reports = [],
    onGenerateReport,
    onExportReport,
    onViewAuditLog,
}) => {
    const { colors } = useTheme();
    const [showBuDropdown, setShowBuDropdown] = React.useState(false);
    const [selectedDateFilter, setSelectedDateFilter] = React.useState(dateFilter);

    React.useEffect(() => {
        setSelectedDateFilter(dateFilter);
    }, [dateFilter]);

    const getSelectedBuName = () => {
        if (selectedBu === 'all') return 'Todos los locales';
        const bu = businessUnits.find(b => b.id === selectedBu);
        return bu ? bu.name : 'Local no encontrado';
    };

    const getSelectedBu = () => {
        if (selectedBu === 'all') return null;
        return businessUnits.find(b => b.id === selectedBu);
    };

    const handleSelectBu = (buId: string) => {
        onSelectBu?.(buId);
        setShowBuDropdown(false);
    };

    const getNewReportButtonText = () => {
        if (selectedBu === 'all') return 'Nuevo Reporte (Todos)';
        const bu = getSelectedBu();
        return `Nuevo Reporte (${bu?.name || ''})`;
    };

    const handleDateFilterSelect = (filter: string) => {
        setSelectedDateFilter(filter);
        onDateFilterChange?.(filter);
    };

    const getPeriodLabel = () => {
        const now = new Date();
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        if (selectedDateFilter === '7d') return 'Última Semana';
        if (selectedDateFilter === '30d') return `Mes de ${monthNames[now.getMonth()]}`;
        if (selectedDateFilter === 'all') return `Año ${now.getFullYear()}`;
        return 'Últimos 7 días';
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: theme.spacing.lg,
            overflow: 'visible',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xl,
            overflow: 'visible',
        },
        title: {
            color: colors.text,
            fontSize: theme.typography.sizes.xxl,
            fontWeight: 'bold',
        },
        subtitle: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.sm,
            marginTop: theme.spacing.xs,
        },
        actions: {
            flexDirection: 'row',
            gap: theme.spacing.md,
            overflow: 'visible',
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            minWidth: 120,
        },
        actionButtonPrimary: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        section: {
            marginBottom: theme.spacing.xl,
            width: '100%',
            overflow: 'visible',
            minHeight: 100,
        },
        sectionTitle: {
            color: colors.text,
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
            marginBottom: theme.spacing.md,
        },
        activityGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.md,
        },
        activityCard: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.xl,
            padding: theme.spacing.lg,
            flex: 1,
            minWidth: 200,
            maxWidth: '48%',
            borderLeftWidth: 4,
        },
        activityHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        activityDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginRight: theme.spacing.sm,
        },
        activityTitle: {
            color: colors.text,
            fontSize: theme.typography.sizes.md,
            fontWeight: 'bold',
        },
        activityStats: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        activityStat: {
            flex: 1,
        },
        activityValue: {
            color: colors.text,
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
        },
        activityLabel: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.xs,
            marginTop: 2,
        },
        emptyState: {
            padding: theme.spacing.xl,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
        },
        reportsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.md,
        },
        reportCard: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.xl,
            padding: theme.spacing.lg,
            flex: 1,
            minWidth: 250,
        },
        reportHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        reportTypeBadge: {
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.spacing.borderRadius.full,
            backgroundColor: colors.primary + '20',
        },
        reportTypeText: {
            color: colors.primary,
            fontSize: theme.typography.sizes.xs,
            fontWeight: 'bold',
            textTransform: 'uppercase',
        },
        reportTitle: {
            color: colors.text,
            fontSize: theme.typography.sizes.md,
            fontWeight: 'bold',
            marginBottom: theme.spacing.xs,
        },
        reportDescription: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.sm,
            marginBottom: theme.spacing.md,
        },
        reportFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: theme.spacing.md,
        },
        reportDate: {
            color: colors.textMuted,
            fontSize: theme.typography.sizes.xs,
        },
        chartPlaceholder: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.xl,
            padding: theme.spacing.lg,
            height: 300,
            justifyContent: 'center',
            alignItems: 'center',
        },
        auditLogSection: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.xl,
            padding: theme.spacing.lg,
        },
        auditLogHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        auditLogItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + '30',
        },
        auditLogIcon: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.md,
        },
        auditLogContent: {
            flex: 1,
        },
        auditLogAction: {
            color: colors.text,
            fontSize: theme.typography.sizes.sm,
            fontWeight: 'bold',
        },
        auditLogDetails: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.xs,
            marginTop: 2,
        },
        auditLogTime: {
            color: colors.textMuted,
            fontSize: theme.typography.sizes.xs,
        },
        buSelectorRow: {
            marginBottom: theme.spacing.md,
            position: 'relative',
            zIndex: Platform.OS === 'web' ? 10000 : 1,
            overflow: 'visible',
        },
        buSelectorButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            flex: 1,
        },
        buSelectorButtonPrimary: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary + '08',
            borderWidth: 2,
            borderColor: colors.primary + '40',
            borderRadius: 8,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 12,
            flex: 1,
            minWidth: 120,
            ...(Platform.OS === 'web' && {
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }),
            ...(Platform.OS !== 'web' && {
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            }),
        },
        buSelectorText: { flex: 1 },
        buSelectorIcon: { marginLeft: 4 },
        buSelectorColor: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
        dropdownPortal: {
            position: 'absolute',
            top: 80,
            left: 20,
            right: 20,
            zIndex: 999999,
        },
        dropdownContainer: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            marginTop: 4,
            zIndex: 999999,
            ...(Platform.OS === 'web' && {
                maxHeight: 300,
                overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            }),
            ...(Platform.OS !== 'web' && {
                elevation: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            }),
        },
        dropdownScrollView: {
            maxHeight: 350,
            overflow: 'visible',
        },
        dropdownHeader: {
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.primary + '40',
            backgroundColor: colors.primary + '20',
        },
        dropdownOption: {
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
        },
        dropdownOptionSelected: {
            backgroundColor: colors.primary + '20',
        },
        dropdownOptionText: {
            flex: 1,
        },
        dropdownOptionColor: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginRight: 10,
        },
        dateFilterRow: {
            flexDirection: 'row',
            marginBottom: theme.spacing.lg,
            backgroundColor: colors.cardBackground,
            padding: 4,
            borderRadius: 8,
            alignSelf: 'flex-start',
        },
        dateChip: {
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6,
        },
        activeDateChip: {
            backgroundColor: colors.primary,
        },
        dateChipText: {
            fontSize: theme.typography.sizes.sm,
            fontWeight: '600',
        },
        // Modal styles
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999999,
        },
        modalContent: {
            backgroundColor: colors.surface,
            borderRadius: theme.spacing.borderRadius.xl,
            width: '90%',
            maxWidth: 400,
            maxHeight: '80%',
            overflow: 'hidden',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalScrollView: {
            maxHeight: 400,
        },
        modalOption: {
            paddingVertical: 14,
            paddingHorizontal: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
        },
        modalOptionSelected: {
            backgroundColor: colors.primary + '20',
        },
    });

    const mockReports: Report[] = [
        {
            id: '1',
            title: 'Reporte de Ventas Diarias',
            description: 'Detalle de transacciones por local y categoría',
            date: new Date('2025-02-18'),
            type: 'sales',
            size: '2.4 MB',
        },
        {
            id: '2',
            title: 'Inventario Mensual',
            description: 'Stock actualizado y movimientos de inventario',
            date: new Date('2025-02-17'),
            type: 'inventory',
            size: '1.8 MB',
        },
        {
            id: '3',
            title: 'Balance Financiero',
            description: 'Estado de resultados y flujo de caja',
            date: new Date('2025-02-16'),
            type: 'financial',
            size: '3.2 MB',
        },
        {
            id: '4',
            title: 'Auditoría de Cierres',
            description: 'Verificación de cierres de caja y conciliaciones',
            date: new Date('2025-02-15'),
            type: 'audit',
            size: '4.1 MB',
        },
    ];

    const mockAuditLog = [
        { id: '1', action: 'Exportación de reporte', user: 'admin@flashreport.com', details: 'Reporte de ventas diarias', time: 'Hace 2 horas' },
        { id: '2', action: 'Generación de reporte', user: 'carlos.mendoza@empresa.com', details: 'Balance financiero Q4', time: 'Hace 5 horas' },
        { id: '3', action: 'Acceso denegado', user: 'intruso@example.com', details: 'Intento de acceso no autorizado', time: 'Hace 1 día' },
        { id: '4', action: 'Configuración modificada', user: 'admin@flashreport.com', details: 'Umbral de alertas actualizado', time: 'Hace 2 días' },
    ];

    // Generate activity data for each business unit (ventas del día)
    const generateActivityItems = (): ActivityItem[] => {
        // Use businessUnits if available, otherwise use mock data
        const units = businessUnits.length > 0 ? businessUnits : [
            { id: '1', name: 'Puesto Norte', color: '#38ff14' },
            { id: '2', name: 'Puesto Sur', color: '#2196f3' },
            { id: '3', name: 'Puesto Este', color: '#e91e63' },
        ];
        
        return units.map((bu, index) => {
            const sales = Math.floor(Math.random() * 50000) + 10000;
            const transactions = Math.floor(Math.random() * 100) + 20;
            const times = ['Hace 5 min', 'Hace 42 min', 'Hace 1h', 'Hace 2h', 'Hace 3h'];
            
            return {
                id: bu.id,
                title: bu.name,
                description: `${transactions} transacciones`,
                amount: `+$${sales.toLocaleString('es-ES')}`,
                amountType: 'positive' as const,
                time: times[index % times.length],
                icon: 'trending-up' as const,
                type: 'revenue' as const,
                businessUnitColor: bu.color, // Pass business unit color
            };
        });
    };

    const activityItems = generateActivityItems();

    // Enrich mock reports with business unit IDs
    const enrichedMockReports = mockReports.map((report, index) => {
        let businessUnitId = 'all';
        if (businessUnits.length > 0) {
            // Assign reports to business units cyclically
            const buIndex = index % businessUnits.length;
            businessUnitId = businessUnits[buIndex].id;
        }
        return { ...report, businessUnitId };
    });

    // Filter reports based on selected business unit
    const filteredReports = selectedBu === 'all' 
        ? enrichedMockReports 
        : enrichedMockReports.filter(report => report.businessUnitId === selectedBu);

    // Filter audit log based on selected business unit (simulated)
    const filteredAuditLog = selectedBu === 'all'
        ? mockAuditLog
        : mockAuditLog.slice(0, 2); // Show fewer items when a specific unit is selected

    const getReportTypeColor = (type: string) => {
        switch (type) {
            case 'sales': return colors.success;
            case 'inventory': return colors.info;
            case 'financial': return colors.warning;
            case 'audit': return colors.primary;
            default: return colors.textSecondary;
        }
    };

    // Generate chart data based on selected filters
    const generateChartData = () => {
        // Calculate total days based on filter
        const totalDays = selectedDateFilter === 'hoy' ? 1 : selectedDateFilter === '7d' ? 7 : selectedDateFilter === '30d' ? 30 : selectedDateFilter === '90d' ? 90 : 365;
        
        // Determine number of points to show proportionally (12 points = 1 year)
        let displayPoints: number;
        let labels: string[] = [];
        
        if (totalDays <= 7) {
            // 7 days or less: show all days
            displayPoints = totalDays;
            for (let i = 0; i < totalDays; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (totalDays - 1 - i));
                labels.push(date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
            }
        } else if (totalDays <= 30) {
            // 30 days: show each day
            displayPoints = totalDays;
            for (let i = 0; i < totalDays; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (totalDays - 1 - i));
                labels.push(date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
            }
        } else {
            // 90 days (3 months): show ~12 points = 1 per month
            // 365 days (1 year): show 12 points = 1 per month
            displayPoints = 12;
            const step = Math.floor(totalDays / displayPoints);
            
            for (let i = 0; i < displayPoints; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (totalDays - 1 - (i * step)));
                labels.push(date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
            }
        }
        
        // Generate mock data for reports (values in thousands for K format)
        const baseMultiplier = selectedBu === 'all' ? 15000 : 5000;
        
        // Generate data points - match the number of display labels
        const data = labels.map(() => Math.floor(Math.random() * 8000) + baseMultiplier);
        
        // Get business units to use as series (or use mock if empty)
        const units = businessUnits.length > 0 ? businessUnits : [
            { id: '1', name: 'Puesto Norte', color: '#38ff14' },
            { id: '2', name: 'Puesto Sur', color: '#2196f3' },
            { id: '3', name: 'Puesto Este', color: '#e91e63' },
        ];

        // Get selected business unit's color
        const selectedBusinessUnit = selectedBu === 'all' ? null : units.find(u => u.id === selectedBu);

        // Generate a series for each business unit when showing all, otherwise single series with business unit color
        const series = selectedBu === 'all' 
            ? units.map((bu) => ({
                id: bu.id,
                name: bu.name,
                color: bu.color || colors.primary,
                data: data.map(v => Math.floor(v * (0.5 + Math.random() * 0.5))),
            }))
            : [{
                id: selectedBu,
                name: selectedBusinessUnit?.name || 'Total',
                color: selectedBusinessUnit?.color || colors.primary,
                data: data,
            }];
        
        return {
            labels: labels,
            series: series,
        };
    };

    const chartData = generateChartData();

    return (
        <View style={{ flex: 1 }}>
            {/* Modal for Business Unit Selection */}
            <Modal
                visible={showBuDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowBuDropdown(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1}
                    onPress={() => setShowBuDropdown(false)}
                >
                    <TouchableOpacity 
                        style={styles.modalContent} 
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <Typography weight="bold" style={{ fontSize: 18 }}>
                                🏪 Seleccionar Unidad de Negocio
                            </Typography>
                            <TouchableOpacity onPress={() => setShowBuDropdown(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScrollView}>
                            <TouchableOpacity
                                style={[styles.modalOption, selectedBu === 'all' && styles.modalOptionSelected]}
                                onPress={() => {
                                    handleSelectBu('all');
                                    setShowBuDropdown(false);
                                }}
                            >
                                <View style={[styles.dropdownOptionColor, { backgroundColor: colors.primary }]} />
                              {/*   <Typography style={styles.dropdownOptionText} weight={selectedBu === 'all' ? 'bold' : 'regular'}>
                                    Todos los locales
                                </Typography> */}
                            </TouchableOpacity>
                            {businessUnits.map(bu => (
                                <TouchableOpacity
                                    key={bu.id}
                                    style={[styles.modalOption, selectedBu === bu.id && styles.modalOptionSelected]}
                                    onPress={() => {
                                        handleSelectBu(bu.id);
                                        setShowBuDropdown(false);
                                    }}
                                >
                                    <View style={[styles.dropdownOptionColor, { backgroundColor: bu.color || colors.primary }]} />
                                    <Typography style={styles.dropdownOptionText} weight={selectedBu === bu.id ? 'bold' : 'regular'}>
                                        {bu.name}
                                    </Typography>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <ScrollView 
                style={styles.container} 
                contentContainerStyle={{ overflow: 'visible', flexGrow: 1 }}
                showsVerticalScrollIndicator={true}
            >
                <View style={{ flex: 1, paddingBottom: 100 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Typography style={styles.title}>
                                Informes y Auditoría
                            </Typography>
                            <Typography style={styles.subtitle}>
                                Genera, exporta y audita reportes del sistema
                            </Typography>
                        </View>
                        <View style={[styles.actions, { zIndex: 100, overflow: 'visible' }]}>
                            {/* Business Unit Selector */}
                            <View style={[styles.buSelectorRow, { zIndex: 100, overflow: 'visible' }]}>
                                <TouchableOpacity 
                                    style={styles.buSelectorButtonPrimary}
                                    onPress={() => setShowBuDropdown(!showBuDropdown)}
                                >
                                    {getSelectedBu() && (
                                        <View style={[styles.buSelectorColor, { backgroundColor: getSelectedBu()?.color || colors.primary }]} />
                                    )}
                                    <Typography style={styles.buSelectorText} weight="bold">
                                        {getSelectedBuName()}
                                    </Typography>
                                    <Ionicons 
                                        name={showBuDropdown ? "chevron-up" : "chevron-down"} 
                                        size={18} 
                                        color={colors.textSecondary} 
                                        style={styles.buSelectorIcon} 
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.actionButtonPrimary]}
                                onPress={() => onGenerateReport?.('sales')}
                            >
                                <Ionicons name="add" size={20} color={colors.cardBackground} />
                                <Typography color={colors.cardBackground} weight="bold">
                                    {getNewReportButtonText()}
                                </Typography>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={onViewAuditLog}
                            >
                                <Ionicons name="shield-checkmark" size={20} color={colors.textSecondary} />
                                <Typography color={colors.textSecondary}>
                                    Auditoría
                                </Typography>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Chart & Activity Section - shared component with filters */}
                    <ChartAndActivitySection
                        chartTitle="Reportes Generados"
                        chartSubtitle={getPeriodLabel()}
                        periodLabel={getPeriodLabel()}
                        chartData={chartData}
                        activityTitle="Actividad Reciente"
                        activityItems={activityItems}
                        chartHeight={300}
                        activityMaxHeight={320}
                        filters={[
                            { value: '7d', label: 'Semana' },
                            { value: '30d', label: 'Mes' },
                            { value: 'all', label: 'Año' },
                        ]}
                        selectedFilter={selectedDateFilter}
                        onFilterChange={handleDateFilterSelect}
                    />

                    {/* Recent Reports */}
                    <View style={styles.section}>
                        <Typography style={styles.sectionTitle}>
                            Reportes Recientes
                        </Typography>
                        <View style={styles.reportsGrid}>
                            {filteredReports.map((report) => (
                                <View key={report.id} style={styles.reportCard}>
                                    <View style={styles.reportHeader}>
                                        <View style={[styles.reportTypeBadge, { backgroundColor: getReportTypeColor(report.type) + '20' }]}>
                                            <Typography style={[styles.reportTypeText, { color: getReportTypeColor(report.type) }]}>
                                                {report.type}
                                            </Typography>
                                        </View>
                                        <Typography variant="caption" color={colors.textMuted}>
                                            {report.size}
                                        </Typography>
                                    </View>
                                    <Typography style={styles.reportTitle}>
                                        {report.title}
                                    </Typography>
                                    <Typography style={styles.reportDescription}>
                                        {report.description}
                                    </Typography>
                                    <View style={styles.reportFooter}>
                                        <Typography style={styles.reportDate}>
                                            {report.date.toLocaleDateString('es-ES')}
                                        </Typography>
                                        <TouchableOpacity onPress={() => onExportReport?.(report)}>
                                            <Ionicons name="download" size={20} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Audit Log */}
                    <View style={styles.section}>
                        <View style={styles.auditLogSection}>
                            <View style={styles.auditLogHeader}>
                                <Typography style={styles.sectionTitle}>
                                    Registro de Auditoría
                                </Typography>
                                <TouchableOpacity>
                                    <Typography color={colors.primary} weight="bold">
                                        Ver Todo
                                    </Typography>
                                </TouchableOpacity>
                            </View>
                            {filteredAuditLog.map((log) => (
                                <View key={log.id} style={styles.auditLogItem}>
                                    <View style={styles.auditLogIcon}>
                                        <Ionicons name="document-text" size={16} color={colors.primary} />
                                    </View>
                                    <View style={styles.auditLogContent}>
                                        <Typography style={styles.auditLogAction}>
                                            {log.action}
                                        </Typography>
                                        <Typography style={styles.auditLogDetails}>
                                            {log.details} • {log.user}
                                        </Typography>
                                    </View>
                                    <Typography style={styles.auditLogTime}>
                                        {log.time}
                                    </Typography>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

// Example usage component
export const ReportsEnhancedExample: React.FC = () => {
    const [businessUnits] = React.useState([
        { id: '1', name: 'Puesto Norte', color: '#38ff14' },
        { id: '2', name: 'Puesto Sur', color: '#2196f3' },
        { id: '3', name: 'Puesto Este', color: '#e91e63' },
    ]);
    const [selectedBu, setSelectedBu] = React.useState('all');
    const [dateFilter, setDateFilter] = React.useState('7d');

    return (
        <ReportsEnhanced
            businessUnits={businessUnits}
            selectedBu={selectedBu}
            onSelectBu={setSelectedBu}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            onGenerateReport={(type) => console.log('Generate', type)}
            onExportReport={(report) => console.log('Export', report)}
            onViewAuditLog={() => console.log('View audit log')}
        />
    );
};