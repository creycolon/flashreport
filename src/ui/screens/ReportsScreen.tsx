import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { theme } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { Typography, Card, Button } from '../components';
import { businessUnitRepository } from '../../infrastructure/repositories/businessUnitRepository';
import { reportService } from '../../application/services/reportService';

export const ReportsScreen = () => {
    const [bus, setBus] = useState<any[]>([]);
    const [selectedBu, setSelectedBu] = useState('all');
    const [loading, setLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState('7d');
    const { colors } = useTheme();

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
    }), [colors]);

    const loadBus = useCallback(async () => {
        const data = await businessUnitRepository.getAll();
        setBus(data);
    }, []);

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
                    <Typography variant="label">Centro de Costos / Local</Typography>
                    <View style={styles.selectorRow}>
                        <TouchableOpacity
                            style={[
                                styles.buChip,
                                selectedBu === 'all' && styles.activeChip
                            ]}
                            onPress={() => setSelectedBu('all')}
                        >
                             <Typography variant="caption" color={selectedBu === 'all' ? colors.text : colors.textSecondary} weight="bold">Todo</Typography>
                        </TouchableOpacity>
                        {bus.map(bu => (
                            <TouchableOpacity
                                key={bu.id}
                                style={[
                                    styles.buChip,
                                    selectedBu === bu.id && { backgroundColor: bu.color, borderColor: bu.color }
                                ]}
                                onPress={() => setSelectedBu(bu.id)}
                            >
                                 <Typography variant="caption" color={selectedBu === bu.id ? colors.text : colors.textSecondary} weight="bold">{bu.name}</Typography>
                            </TouchableOpacity>
                        ))}
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
                        Este reporte incluye los créditos y débitos del local y rango seleccionados.
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
