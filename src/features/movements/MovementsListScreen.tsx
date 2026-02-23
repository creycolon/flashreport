import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform, Modal, TouchableWithoutFeedback, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@ui/shared/theme';
import { Typography, Card, Button } from '@ui/shared/components';
import { cashMovementRepository } from '@core/infrastructure/repositories/cashMovementRepository';
import { businessUnitRepository } from '@core/infrastructure/repositories/businessUnitRepository';
import { configRepository } from '@core/infrastructure/repositories/configRepository';
import { formatCurrency, formatDate } from '@core/application/utils/format';
import { reportService } from '@core/application/services/reportService';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { MovementsFiltersEnhanced, MovementsTableEnhanced, Movement } from '@ui/web/components';
import { pluralizeSpanish } from '@core/utils/stringUtils';

export const MovementsListScreen = () => {
    const [movements, setMovements] = useState<any[]>([]);
    const [bus, setBus] = useState<any[]>([]);
    const [selectedBu, setSelectedBu] = useState('all');
    const [loading, setLoading] = useState(true);
    const [lastMovementId, setLastMovementId] = useState<string | null>(null);
    const [querySummary, setQuerySummary] = useState<string>('');
    const [balanceInfo, setBalanceInfo] = useState({ total_credits: 0, total_debits: 0, balance: 0 });
    const [showDropdown, setShowDropdown] = useState(false);
    const [buttonLayout, setButtonLayout] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const buttonRef = useRef<View>(null);
    const [businessLabel, setBusinessLabel] = useState('Local');

    // Filters
    const [dateFilter, setDateFilter] = useState('7d'); // 1d, 7d, 30d, all
    const [searchQuery, setSearchQuery] = useState('');
    const { colors } = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    const isWebDesktop = Platform.OS === 'web' && windowWidth >= 1024;

    const styles = useMemo(() => StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        container: {
            flex: 1,
            padding: theme.spacing.md,
            overflow: 'visible',
            ...Platform.select({
                web: {
                    position: 'static',
                },
                default: {
                    position: 'relative',
                }
            }),
        },
        header: {
            marginBottom: theme.spacing.md,
            position: 'relative',
            zIndex: Platform.OS === 'web' ? 10000 : 1,
        },
        buSelectorRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
            position: 'relative',
            zIndex: Platform.OS === 'web' ? 10000 : 10,
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
            paddingVertical: 8,
            flex: 1,
        },
        buSelectorText: { flex: 1 },
        buSelectorIcon: { marginLeft: 4 },
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
            zIndex: Platform.OS === 'web' ? 2147483647 : 1000,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            ...Platform.select({
                web: {
                    maxHeight: 300,
                    overflow: 'scroll',
                    borderWidth: 2,
                    borderColor: 'red',
                },
                default: {}
            })
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
        dropdownHeader: {
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.primary + '10',
        },
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
        modalContent: { backgroundColor: colors.cardBackground, borderRadius: 16, padding: 24, maxHeight: '80%' },
        modalTitle: { marginBottom: 16 },
        modalOption: {
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
        },
        modalOptionSelected: { backgroundColor: colors.primary + '20' },
        modalOptionText: { flex: 1 },
        modalOptionColor: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
        dateFilterRow: { flexDirection: 'row', marginTop: 8, gap: 8 },
        dateChip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
        activeDateChip: { borderBottomColor: colors.primary },
        summaryCard: {
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
            backgroundColor: colors.cardBackground,
            ...(Platform.OS === 'web' ? {
                position: 'static',
            } : {
                zIndex: 0,
                position: 'relative',
            }),
        },
        summaryVerticalList: {},
        summaryRowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 0 },
        list: { paddingBottom: 120 },
        itemCard: { flexDirection: 'row', padding: theme.spacing.md, marginBottom: theme.spacing.sm, alignItems: 'center' },
        typeIndicator: { width: 4, height: '80%', borderRadius: 2, marginRight: theme.spacing.md },
        itemContent: { flex: 1 },
        itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
        description: { fontSize: 13, marginTop: 4 },
        deleteButton: { padding: 8, borderRadius: 4, backgroundColor: colors.danger + '10' },
    }), [colors]);

    const getDateRange = () => {
        const end = new Date();
        const start = new Date();

        if (dateFilter === '1d') {
            start.setHours(0, 0, 0, 0);
            // End of today
            end.setHours(23, 59, 59, 999);
        } else if (dateFilter === '7d') {
            start.setDate(end.getDate() - 7);
            start.setHours(0, 0, 0, 0);
        } else if (dateFilter === '30d') {
            start.setDate(end.getDate() - 30);
            start.setHours(0, 0, 0, 0);
        } else {
            return { start: undefined, end: undefined };
        }

        return {
            start: start.toISOString(),
            end: end.toISOString()
        };
    };

    const truncateName = (name: string, length = 5) => {
        if (!name) return '';
        return name.length > length ? name.substring(0, length) + '.' : name;
    };

    const loadData = async () => {
        // Debug: console.log('[MovementsList] loadData called, selectedBu:', selectedBu, 'dateFilter:', dateFilter);
        setLoading(true);
        try {
            // Load business units if not already loaded
            if (bus.length === 0) {
                const fetchedBus = await businessUnitRepository.getAll();
                setBus(fetchedBus || []);
            }

            const { start, end } = getDateRange();
            // Debug: console.log('[MovementsList] date range:', { start, end });

            if (selectedBu === 'all') {
                const [list, balance] = await Promise.all([
                    (cashMovementRepository as any).listAll(300, 0, start, end),
                    (cashMovementRepository as any).getGlobalBalance(start, end)
                ]);
                setMovements(list || []);
                setBalanceInfo(balance || { total_credits: 0, total_debits: 0, balance: 0 });
                setLastMovementId(null);
                // Build summary text
                const count = list?.length || 0;
                const rangeText = start && end ? `${formatDate(start)} - ${formatDate(end)}` : 'todo el tiempo';
                setQuerySummary(`Mostrando ${count} movimiento${count !== 1 ? 's' : ''} para todos los ${pluralizeSpanish(businessLabel)} entre ${rangeText}`);
            } else {
                const [list, last, balance] = await Promise.all([
                    (cashMovementRepository as any).listByBusinessUnit(selectedBu, 200, 0, start, end),
                    (cashMovementRepository as any).getLastMovementForBU(selectedBu),
                    (cashMovementRepository as any).getBalance(selectedBu, start, end)
                ]);
                setMovements(list || []);
                setLastMovementId(last?.id || null);
                setBalanceInfo(balance || { total_credits: 0, total_debits: 0, balance: 0 });
                // Build summary text for specific BU
                const count = list?.length || 0;
                const rangeText = start && end ? `${formatDate(start)} - ${formatDate(end)}` : 'todo el tiempo';
                const buName = getSelectedBuName();
                setQuerySummary(`Mostrando ${count} movimiento${count !== 1 ? 's' : ''} para ${buName} entre ${rangeText}`);
            }
        } catch (error) {
            console.error('[MovementsList] Error:', error);
        } finally {
            // Debug: console.log('[MovementsList] loadData completed');
            setLoading(false);
        }
    };

    const loadBusinessLabel = async () => {
        const label = await (configRepository as any).get('default_business', 'Local');
        setBusinessLabel(label);
    };

    useEffect(() => {
        loadData();
        loadBusinessLabel();
    }, [selectedBu, dateFilter]);

    useEffect(() => {
        if (Platform.OS === 'web' && showDropdown && buttonRef.current) {
            buttonRef.current.measureInWindow((x, y, width, height) => {
                setButtonLayout({ x, y, width, height });
            });
        }
    }, [showDropdown]);

    const handleButtonLayout = (event: any) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setButtonLayout({ x, y, width, height });
    };

    const handleExport = async () => {
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

    // ... (handleDelete and renderItem stay same but adding BU name in list if all)
    const handleDelete = (id: string) => {
        if (id !== lastMovementId) {
            Alert.alert('Restricción', 'Solo puedes eliminar el último movimiento registrado.');
            return;
        }
        Alert.alert('Confirmar', '¿Eliminar este movimiento?', [
            { text: 'No' },
            { text: 'Sí', onPress: async () => { await cashMovementRepository.softDelete(id); loadData(); } }
        ]);
    };

    const renderItem = ({ item }: { item: any }) => {
        if (!item) return null;
        const isCredit = item.type === 'CR';
        const isLastInBu = item.id === lastMovementId;
        const isEditable = selectedBu === 'all'
            ? item.id === movements[0]?.id
            : isLastInBu;

        // Usar color del negocio si está disponible
        const selectedColor = getSelectedBuColor();

        // Si selectedBu no es 'all', usar ese color; si es 'all', usar el color del movimiento
        let itemColor: string;
        if (selectedBu !== 'all' && selectedColor) {
            itemColor = selectedColor;
        } else if (item.bu_color) {
            itemColor = item.bu_color;
        } else {
            itemColor = isCredit ? colors.success : colors.danger;
        }

        return (
            <Card variant="outline" style={styles.itemCard}>
                <View style={[styles.typeIndicator, { backgroundColor: itemColor }]} />
                <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                        <View>
                            <Typography variant="body" weight="bold">{truncateName(item.category_name || '', 12)}</Typography>
                            <Typography variant="caption" style={{ color: colors.textSecondary }}>
                                {truncateName(item.bu_name)}
                            </Typography>
                        </View>
                        <Typography
                            variant="body"
                            color={isCredit ? colors.success : colors.danger}
                            weight="bold"
                            style={{ textAlign: 'right', flex: 1, fontSize: 12 }}
                        >
                            {isCredit ? '+' : '-'}{formatCurrency(item.amount)}
                        </Typography>
                    </View>
                    <Typography variant="caption" color={colors.textSecondary}>
                        #{item.sequence_number} • {formatDate(item.transaction_date)}
                    </Typography>
                    {item.description ? <Typography variant="body" style={styles.description}>{item.description}</Typography> : null}
                </View>
                {isEditable && (
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                        <Typography color={colors.danger} variant="caption" weight="bold">BORRAR</Typography>
                    </TouchableOpacity>
                )}
            </Card>
        );
    };

    const getSelectedBuName = () => {
        if (selectedBu === 'all') return `Todos los ${pluralizeSpanish(businessLabel)}`;
        const bu = bus.find(b => b.id === selectedBu);
        return bu ? bu.name : `${businessLabel} no encontrado`;
    };

    const getSelectedBuColor = () => {
        if (selectedBu === 'all') return null;
        const bu = bus.find(b => b.id === selectedBu);
        return bu ? bu.color : null;
    };

    const handleSelectBu = (buId: string) => {
        setSelectedBu(buId);
        setShowDropdown(false);
    };

    // Convert movements to enhanced format
    // const enhancedMovements: Movement[] = movements.map((mov: any) => ({
    //     id: mov.id,
    //     date: new Date(mov.transaction_date),
    //     description: mov.description || mov.category_name || '',        
    //     amount: mov.amount,
    //     type: mov.type === 'CR' ? 'credit' : 'debit',
    //     businessUnit: mov.bu_name,
    //     pointOfSale: mov.pos_name || 'N/A',
    //     status: mov.status || 'completed',
    // }));

    const enhancedMovements: Movement[] = movements.map((mov: any) => {
        // Limpiar descripción: quitar el nombre del local si viene en category_name
        let cleanDescription = mov.description || mov.category_name || '';
        if (cleanDescription.includes(' - ')) {
            cleanDescription = cleanDescription.split(' - ')[0].trim();
        }

        // Limpiar POS: quitar el nombre del business unit si está incluido
        let cleanPosName = 'N/A';
        if (mov.pos_name) {
            if (mov.bu_name && mov.pos_name.includes(mov.bu_name)) {
                // Remover el nombre del business unit y dejar solo "POS X"
                cleanPosName = mov.pos_name.replace(mov.bu_name, '').trim() || 'N/A';
            } else {
                cleanPosName = mov.pos_name;
            }
        }

        return {
            id: mov.id,
            date: new Date(mov.transaction_date),
            description: cleanDescription,
            amount: mov.amount,
            type: mov.type === 'CR' ? 'credit' : 'debit',
            businessUnit: mov.bu_name,
            pointOfSale: cleanPosName,
            status: mov.status || 'completed',
        };
    });


    // Filter enhanced movements by search query
    const filteredEnhancedMovements = enhancedMovements.filter(movement => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            movement.description?.toLowerCase().includes(query) ||
            movement.businessUnit?.toLowerCase().includes(query) ||
            movement.pointOfSale?.toLowerCase().includes(query) ||
            movement.amount.toString().includes(query) ||
            movement.type.toLowerCase().includes(query)
        );
    });

    // Enhanced view for web desktop
    if (isWebDesktop) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, padding: theme.spacing.lg }}>
                <MovementsFiltersEnhanced
                    businessUnits={bus}
                    selectedBu={selectedBu}
                    onSelectBu={setSelectedBu}
                    onSearch={setSearchQuery}
                    onDateFilterChange={(filter) => setDateFilter(filter)}
                    onExport={handleExport}
                    onFilter={() => console.log('Filter')}
                    onReset={() => {
                        setSelectedBu('all');
                        setDateFilter('7d');
                        setSearchQuery('');
                    }}
                    dateFilter={dateFilter}
                    searchQuery={searchQuery}
                    businessLabel={businessLabel}
                />
                <MovementsTableEnhanced
                    movements={filteredEnhancedMovements}
                    onRowPress={(movement) => console.log('Row press', movement)}
                    onEdit={(movement) => console.log('Edit', movement)}
                    onDelete={(movement) => console.log('Delete', movement)}
                    loading={loading}
                />
            </View>
        );
    }

    return (
        <View style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Typography variant="h2">Movimientos</Typography>

                    {/* Business Unit Selector */}
                    <Typography variant="label" style={{ marginBottom: 4 }}>Filtrar por {businessLabel}</Typography>
                    <View style={styles.buSelectorRow}>
                        <TouchableOpacity
                            ref={buttonRef}
                            style={styles.buSelectorButton}
                            onPress={() => setShowDropdown(!showDropdown)}
                            onLayout={handleButtonLayout}
                        >
                            <Typography style={styles.buSelectorText} weight="bold">
                                {getSelectedBuName()}
                            </Typography>
                            <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} style={styles.buSelectorIcon} />
                        </TouchableOpacity>

                        {showDropdown && (
                            <View style={styles.dropdownContainer}>
                                <View style={styles.dropdownHeader}>
                                    <Typography variant="caption" weight="bold" color={colors.primary}>Filtrar por {businessLabel}</Typography>
                                </View>
                                <TouchableOpacity
                                    style={[styles.dropdownOption, selectedBu === 'all' && styles.dropdownOptionSelected]}
                                    onPress={() => handleSelectBu('all')}
                                >
                                    <Typography style={styles.dropdownOptionText} weight="bold">Todos los {pluralizeSpanish(businessLabel)}</Typography>
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

                    {/* Date Filter */}
                    <View style={styles.dateFilterRow}>
                        {['1d', '7d', '30d', 'all'].map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.dateChip, dateFilter === f && styles.activeDateChip]}
                                onPress={() => setDateFilter(f)}
                            >
                                <Typography variant="caption" weight="bold" color={dateFilter === f ? colors.primary : colors.textSecondary}>
                                    {f === '1d' ? 'Hoy' : f === '7d' ? '7 días' : f === '30d' ? '30 días' : 'Todo'}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Summary Card */}
                {/* Query Summary */}
                {querySummary ? (
                    <Typography variant="caption" style={{ marginBottom: 8, color: colors.textSecondary }}>
                        {querySummary}
                    </Typography>
                ) : null}
                <Card style={styles.summaryCard}>
                    <View style={styles.summaryVerticalList}>
                        <View style={styles.summaryRowItem}>
                            <Typography variant="caption" color={colors.textSecondary}>Ingresos</Typography>
                            <Typography weight="bold" color={colors.success}>{formatCurrency(balanceInfo.total_credits || 0)}</Typography>
                        </View>
                        <View style={styles.summaryRowItem}>
                            <Typography variant="caption" color={colors.textSecondary}>Egresos</Typography>
                            <Typography weight="bold" color={colors.danger}>{formatCurrency(balanceInfo.total_debits || 0)}</Typography>
                        </View>
                        <View style={styles.summaryRowItem}>
                            <Typography variant="body" weight="bold">Saldo Total</Typography>
                            <Typography variant="h3" color={colors.text}>{formatCurrency(balanceInfo.balance || 0)}</Typography>
                        </View>
                    </View>
                </Card>

                {loading ? (
                    <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
                ) : (
                    <FlatList
                        data={movements}
                        keyExtractor={(item) => item?.id || Math.random().toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Typography align="center" style={{ marginTop: 40 }} color={colors.textMuted}>Sin movimientos en este rango</Typography>}
                    />
                )}


            </View>
        </View>
    );
};


