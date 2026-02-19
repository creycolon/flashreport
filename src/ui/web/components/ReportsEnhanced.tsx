import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Card, Button } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';

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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: theme.spacing.lg,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xl,
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
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.spacing.borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
        },
        actionButtonPrimary: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        section: {
            marginBottom: theme.spacing.xl,
        },
        sectionTitle: {
            color: colors.text,
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
            marginBottom: theme.spacing.md,
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
            marginBottom: theme.spacing.xl,
            position: 'relative',
            zIndex: 10000,
            overflow: 'visible',
        },
        buSelectorButton: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.md,
            padding: theme.spacing.md,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        buSelectorText: {
            color: colors.text,
            fontSize: theme.typography.sizes.md,
        },
        buSelectorIcon: {
            marginLeft: theme.spacing.sm,
        },
        dropdownContainer: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.md,
            marginTop: theme.spacing.xs,
            zIndex: 10001,
            maxHeight: 300,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            ...(Platform.OS === 'web' && {
                overflowY: 'auto',
            }),
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
            marginTop: theme.spacing.md,
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xl,
        },
        dateChip: {
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.spacing.borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
        },
        activeDateChip: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        dateChipText: {
            fontSize: theme.typography.sizes.sm,
            fontWeight: '600',
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

    return (
        <ScrollView style={styles.container}>
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
                <View style={styles.actions}>
                    {/* Business Unit Selector - integrated into header row */}
                    <View style={{ position: 'relative', minWidth: 200, overflow: 'visible', zIndex: 10000 }}>
                        <TouchableOpacity 
                            style={[styles.actionButton, { paddingHorizontal: theme.spacing.lg }]}
                            onPress={() => setShowBuDropdown(!showBuDropdown)}
                        >
                            {getSelectedBu() && (
                                <View style={[styles.dropdownOptionColor, { backgroundColor: getSelectedBu()?.color || colors.primary }]} />
                            )}
                            <Typography style={{ color: colors.text, fontSize: theme.typography.sizes.sm, fontWeight: 'bold' }}>
                                {getSelectedBuName()}
                            </Typography>
                            <Ionicons 
                                name={showBuDropdown ? "chevron-up" : "chevron-down"} 
                                size={16} 
                                color={colors.textSecondary} 
                                style={{ marginLeft: theme.spacing.xs }}
                            />
                        </TouchableOpacity>
                        
                        {showBuDropdown && (
                            <View style={styles.dropdownContainer}>
                                <View style={styles.dropdownHeader}>
                                    <Typography variant="caption" weight="bold" color={colors.primary}>🏪 Seleccionar Unidad de Negocio</Typography>
                                </View>
                                <TouchableOpacity
                                    style={[styles.dropdownOption, selectedBu === 'all' && styles.dropdownOptionSelected]}
                                    onPress={() => handleSelectBu('all')}
                                >
                                    <View style={[styles.dropdownOptionColor, { backgroundColor: colors.primary }]} />
                                    <Typography style={styles.dropdownOptionText}>Todos los locales</Typography>
                                </TouchableOpacity>
                                {businessUnits.map(bu => (
                                    <TouchableOpacity
                                        key={bu.id}
                                        style={[styles.dropdownOption, selectedBu === bu.id && styles.dropdownOptionSelected]}
                                        onPress={() => handleSelectBu(bu.id)}
                                    >
                                        <View style={[styles.dropdownOptionColor, { backgroundColor: bu.color || colors.primary }]} />
                                        <Typography style={styles.dropdownOptionText}>{bu.name}</Typography>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
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

            {/* Date Filter */}
            <View style={styles.dateFilterRow}>
                <Typography variant="label">Rango de Fecha</Typography>
                 <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap', marginTop: theme.spacing.sm }}>
                     {['hoy', '7d', '30d', 'all'].map((filter) => {
                         const isActive = selectedDateFilter === filter;
                         return (
                             <TouchableOpacity
                                 key={filter}
                                 style={[styles.dateChip, isActive && styles.activeDateChip]}
                                 onPress={() => handleDateFilterSelect(filter)}
                             >
                                 <Typography
                                     style={styles.dateChipText}
                                     color={isActive ? colors.cardBackground : colors.textSecondary}
                                     weight={isActive ? 'bold' : 'regular'}
                                 >
                                     {filter === 'hoy' ? 'Hoy' : filter === '7d' ? 'Últimos 7 días' : filter === '30d' ? 'Últimos 30 días' : 'Todo'}
                                 </Typography>
                             </TouchableOpacity>
                         );
                     })}
                 </View>
            </View>

            {/* Chart Section */}
            <View style={styles.section}>
                <Typography style={styles.sectionTitle}>
                    Tendencia de Generación
                </Typography>
                <View style={styles.chartPlaceholder}>
                    <Ionicons name="bar-chart" size={48} color={colors.textSecondary} />
                    <Typography color={colors.textSecondary} style={{ marginTop: theme.spacing.md }}>
                         Gráfico de reportes generados para {getSelectedBuName()}
                    </Typography>
                </View>
            </View>

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
        </ScrollView>
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