import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@ui/shared/theme';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { Typography, Card, Button } from '@ui/shared/components';
import { businessUnitRepository } from '@core/infrastructure/repositories/businessUnitRepository';
import { configRepository } from '@core/infrastructure/repositories/configRepository';
import { reportService } from '@core/application/services/reportService';
import { managingPartnerService } from '@core/application/services/managingPartnerService';
import { auditLogRepository } from '@core/infrastructure/repositories/auditLogRepository';
import { ReportsEnhanced } from '@ui/web/components';
import { pluralizeSpanish } from '@core/utils/stringUtils';

export const ReportsScreen = () => {
    const [bus, setBus] = useState<any[]>([]);
    const [selectedBu, setSelectedBu] = useState('all');
    const [loading, setLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState('7d');
    const [showDropdown, setShowDropdown] = useState(false);
    const [businessLabel, setBusinessLabel] = useState('Local');
    const { colors } = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    const isWebDesktop = Platform.OS === 'web' && windowWidth >= 1024;

    const styles = useMemo(() => StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        container: { flex: 1 },
        content: { padding: theme.spacing.md, paddingBottom: 100 },
        header: { marginBottom: theme.spacing.xl },
        reportCard: { padding: theme.spacing.lg, backgroundColor: colors.cardBackground },
        selectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.sm, marginBottom: theme.spacing.md },
        buChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
        activeChip: { backgroundColor: colors.primary, borderColor: colors.primary },
        divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
        buSelectorRow: {
            marginBottom: theme.spacing.md,
            position: 'relative',
            zIndex: Platform.OS === 'web' ? 10000 : 1,
            overflow: 'visible',
        },
        buSelectorButtonPrimary: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary + '08',
            borderWidth: 2,
            borderColor: colors.primary + '40',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            flex: 1,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        buSelectorText: { flex: 1 },
        buSelectorIcon: { marginLeft: 4 },
        buSelectorColor: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
        dropdownContainer: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            marginTop: 4,
            ...(Platform.OS === 'web' && {
                maxHeight: 300,
                overflowY: 'auto',
            }),
            zIndex: 10001,
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
        dropdownOptionSelected: { backgroundColor: colors.primary + '20' },
        dropdownOptionText: { flex: 1 },
        dropdownOptionColor: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    }), [colors]);

    const loadBus = useCallback(async () => {
        const data = await businessUnitRepository.getAll();
        setBus(data);

        const label = await (configRepository as any).get('default_business', 'Local');
        setBusinessLabel(label);
    }, []);

    const getSelectedBuName = () => {
        if (selectedBu === 'all') return `Todos los ${pluralizeSpanish(businessLabel)}`;
        const bu = bus.find(b => b.id === selectedBu);
        return bu ? bu.name : `${businessLabel} no encontrado`;
    };

    const getSelectedBu = () => {
        if (selectedBu === 'all') return null;
        return bus.find(b => b.id === selectedBu);
    };

    const handleSelectBu = (buId: string) => {
        setSelectedBu(buId);
        setShowDropdown(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadBus();
        }, [loadBus])
    );

    const getDateRange = () => {
        const end = new Date();
        const start = new Date();
        if (dateFilter === 'hoy') start.setHours(0, 0, 0, 0);
        else if (dateFilter === '7d') start.setDate(end.getDate() - 7);
        else if (dateFilter === '30d') start.setDate(end.getDate() - 30);
        else return { start: undefined, end: undefined };

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        const { start, end } = getDateRange();
        try {
            await reportService.generateCashMovementReport(selectedBu, start, end);
            Alert.alert('Éxito', 'Reporte generado correctamente. Se abrirá el menú para compartir o enviar por email.');
        } catch (error) {
            Alert.alert('Error', 'No se pudo generar el reporte PDF.');
        } finally {
            setLoading(false);
        }
    };

    // Enhanced view for web desktop
    if (isWebDesktop) {
        const getPeriodDays = (filter: string): number => {
            switch (filter) {
                case '7d': return 7;
                case '30d': return 30;
                case 'all': return 365;
                default: return 7;
            }
        };

        const getPeriodLabel = (filter: string): string => {
            switch (filter) {
                case '7d': return 'Semana';
                case '30d': return 'Mes';
                case 'all': return 'Año';
                default: return 'Semana';
            }
        };

        const getBusinessUnitLabel = () => {
            if (selectedBu === 'all') return 'Todos';
            const bu = bus.find(b => b.id === selectedBu);
            return bu ? bu.name : 'Desconocido';
        };

        const handleGenerateEnhancedReport = async (type: string) => {
            console.log('Generate enhanced report:', type);
            
            try {
                const managingPartner = await managingPartnerService.getCurrentManagingPartner();
                const periodDays = getPeriodDays(dateFilter);
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - periodDays);

                await auditLogRepository.create({
                    userId: managingPartner?.id,
                    action: 'GENERATE_REPORT',
                    entityType: type,
                    businessUnitFilter: getBusinessUnitLabel(),
                    periodFilter: getPeriodLabel(dateFilter),
                    periodDays: periodDays,
                    periodStart: startDate.toISOString().split('T')[0],
                    periodEnd: endDate.toISOString().split('T')[0],
                    details: { reportType: type }
                });

                console.log('[Reports] Audit log saved');
            } catch (error) {
                console.error('[Reports] Error saving audit log:', error);
            }

            handleGenerateReport();
        };

        const handleExportReport = (report: any) => {
            console.log('Export report:', report);
            Alert.alert('Exportar', `Exportando reporte: ${report.title}`);
        };

        const handleViewAuditLog = () => {
            console.log('View audit log');
            Alert.alert('Auditoría', 'Mostrando registro de auditoría');
        };

        return (
            <ReportsEnhanced
                businessUnits={bus}
                selectedBu={selectedBu}
                onSelectBu={setSelectedBu}
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                onGenerateReport={handleGenerateEnhancedReport}
                onExportReport={handleExportReport}
                onViewAuditLog={handleViewAuditLog}
                businessLabel={businessLabel}
            />
        );
    }

    return (
        <View style={styles.safe}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Typography variant="h1">Reportes</Typography>
                    <Typography variant="body" color={colors.textSecondary}>
                        Genera cierres de caja y estados de cuenta en PDF
                    </Typography>
                </View>

                <Card variant="flat" style={styles.reportCard}>
                    <Typography variant="label">🏪 {businessLabel}</Typography>
                    <Typography variant="caption" color={colors.textMuted} style={{ marginBottom: 8 }}>Selecciona el destino</Typography>
                    <View style={styles.buSelectorRow}>
                        <TouchableOpacity
                            style={styles.buSelectorButtonPrimary}
                            onPress={() => setShowDropdown(!showDropdown)}
                        >
                            {getSelectedBu() && (
                                <View style={[styles.buSelectorColor, { backgroundColor: getSelectedBu()?.color || colors.primary }]} />
                            )}
                            <Typography style={styles.buSelectorText} weight="bold">
                                {getSelectedBuName()}
                            </Typography>
                            <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} style={styles.buSelectorIcon} />
                        </TouchableOpacity>

                        {showDropdown && (
                            <View style={styles.dropdownContainer}>
                                <View style={styles.dropdownHeader}>
                                    <Typography variant="caption" weight="bold" color={colors.primary}>🏪 Seleccionar {businessLabel}</Typography>
                                </View>
                                <TouchableOpacity
                                    style={[styles.dropdownOption, selectedBu === 'all' && styles.dropdownOptionSelected]}
                                    onPress={() => handleSelectBu('all')}
                                >
                                    <View style={[styles.dropdownOptionColor, { backgroundColor: colors.primary }]} />
                                    <Typography style={styles.dropdownOptionText}>Todos los {pluralizeSpanish(businessLabel)}</Typography>
                                </TouchableOpacity>
                                {bus.map(bu => (
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

                    <View style={styles.divider} />

                    <Typography variant="label">Rango de Fecha</Typography>
                    <View style={styles.selectorRow}>
                        {['hoy', '7d', '30d', 'all'].map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[
                                    styles.buChip,
                                    dateFilter === f && styles.activeChip
                                ]}
                                onPress={() => setDateFilter(f)}
                            >
                                <Typography
                                    variant="caption"
                                    color={dateFilter === f ? colors.text : colors.textSecondary}
                                    weight="bold"
                                >
                                    {f === 'hoy' ? 'Hoy' : f === '7d' ? 'Últ. 7 días' : f === '30d' ? 'Últ. 30 días' : 'Histórico'}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    <Typography variant="h3" style={{ marginBottom: 10 }}>Cierre de Movimientos</Typography>
                    <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: 20 }}>
                        Este reporte incluye los créditos y débitos del {businessLabel.toLowerCase()} y rango seleccionados.
                    </Typography>

                    <Button
                        title="Exportar PDF de Caja"
                        onPress={handleGenerateReport}
                        loading={loading}
                    />
                </Card>

                <Card variant="outline" style={[styles.reportCard, { marginTop: 20 }]}>
                    <Typography variant="h3" style={{ marginBottom: 10 }}>Estado de Socios</Typography>
                    <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: 20 }}>
                        Resumen de saldos y retiros por cada socio (Próxima actualización).
                    </Typography>
                    <Button
                        title="Próximamente"
                        onPress={() => { }}
                        variant="outline"
                        disabled
                    />
                </Card>
            </ScrollView>
        </View>
    );
};
