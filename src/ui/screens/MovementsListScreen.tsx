import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform, Modal } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Typography, Card, Button } from '../components';
import { cashMovementRepository } from '../../infrastructure/repositories/cashMovementRepository';
import { businessUnitRepository } from '../../infrastructure/repositories/businessUnitRepository';
import { formatCurrency, formatDate } from '../../application/utils/format';
import { useTheme } from '../theme/ThemeContext';

export const MovementsListScreen = () => {
    const [movements, setMovements] = useState<any[]>([]);
    const [bus, setBus] = useState<any[]>([]);
    const [selectedBu, setSelectedBu] = useState('all');
    const [loading, setLoading] = useState(true);
    const [lastMovementId, setLastMovementId] = useState<string | null>(null);
    const [balanceInfo, setBalanceInfo] = useState({ total_credits: 0, total_debits: 0, balance: 0 });
    const [showDropdown, setShowDropdown] = useState(false);

    // Filters
    const [dateFilter, setDateFilter] = useState('7d'); // 1d, 7d, 30d, all
    const { colors } = useTheme();
    
    const styles = useMemo(() => StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        container: { 
            flex: 1, 
            padding: theme.spacing.md,
            overflow: 'visible',
            position: 'relative',
        },
        header: { marginBottom: theme.spacing.md },
        buSelectorRow: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 8, 
            position: 'relative',
            zIndex: Platform.OS === 'web' ? 100 : 10,
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
            // Web-specific styles
            ...(Platform.OS === 'web' && {
                maxHeight: 300,
                overflowY: 'auto',
            }),
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
            zIndex: 0,
            position: 'relative',
        },
        summaryVerticalList: { },
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
        if (dateFilter === '1d') start.setHours(0, 0, 0, 0);
        else if (dateFilter === '7d') start.setDate(end.getDate() - 7);
        else if (dateFilter === '30d') start.setDate(end.getDate() - 30);
        else return { start: null, end: null };

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    };

    const truncateName = (name: string, length = 5) => {
        if (!name) return '';
        return name.length > length ? name.substring(0, length) + '.' : name;
    };

    const loadData = async () => {
        console.log('[MovementsList] loadData called, selectedBu:', selectedBu, 'dateFilter:', dateFilter);
        setLoading(true);
        try {
            // Load business units if not already loaded
            if (bus.length === 0) {
                const fetchedBus = await businessUnitRepository.getAll();
                setBus(fetchedBus || []);
            }

            const { start, end } = getDateRange();
            console.log('[MovementsList] date range:', { start, end });

            if (selectedBu === 'all') {
                console.log('[MovementsList] Fetching all movements...');
                const [list, balance] = await Promise.all([
                    (cashMovementRepository as any).listAll(300, 0, start, end),
                    (cashMovementRepository as any).getGlobalBalance(start, end)
                ]);
                console.log('[MovementsList] listAll result:', list?.length, 'movements');
                console.log('[MovementsList] balance result:', balance);
                setMovements(list || []);
                setBalanceInfo(balance || { total_credits: 0, total_debits: 0, balance: 0 });
                setLastMovementId(null);
            } else {
                console.log('[MovementsList] Fetching movements for BU:', selectedBu);
                const [list, last, balance] = await Promise.all([
                    (cashMovementRepository as any).listByBusinessUnit(selectedBu, 200, 0, start, end),
                    (cashMovementRepository as any).getLastMovementForBU(selectedBu),
                    (cashMovementRepository as any).getBalance(selectedBu, start, end)
                ]);
                console.log('[MovementsList] listByBusinessUnit result:', list?.length, 'movements');
                console.log('[MovementsList] last movement:', last?.id);
                console.log('[MovementsList] balance result:', balance);
                setMovements(list || []);
                setLastMovementId(last?.id || null);
                setBalanceInfo(balance || { total_credits: 0, total_debits: 0, balance: 0 });
            }
        } catch (error) {
            console.error('[MovementsList] Error:', error);
        } finally {
            console.log('[MovementsList] loadData completed');
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [selectedBu, dateFilter])
    );

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
        const itemColor = selectedColor || item.bu_color || (isCredit ? colors.success : colors.danger);

        return (
            <Card variant="outline" style={styles.itemCard}>
                <View style={[styles.typeIndicator, { backgroundColor: itemColor }]} />
                <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                        <View>
                            <Typography weight="bold">{item.category_name || ''}</Typography>
                            {selectedBu === 'all' && (
                                <Typography variant="caption" style={{ color: item.bu_color || colors.textSecondary }}>
                                    {truncateName(item.bu_name)}
                                </Typography>
                            )}
                        </View>
                        <Typography color={isCredit ? colors.success : colors.danger} weight="bold">
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
        if (selectedBu === 'all') return 'Todos los locales';
        const bu = bus.find(b => b.id === selectedBu);
        return bu ? bu.name : 'Local no encontrado';
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

    return (
        <View style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Typography variant="h2">Movimientos</Typography>

                    {/* Business Unit Selector */}
                    <Typography variant="label" style={{ marginBottom: 4 }}>Filtrar Negocio</Typography>
                    <View style={styles.buSelectorRow}>
                        <TouchableOpacity 
                            style={styles.buSelectorButton}
                             onPress={() => setShowDropdown(!showDropdown)}
                        >
                            <Typography style={styles.buSelectorText} weight="bold">
                                {getSelectedBuName()}
                            </Typography>
                            <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} style={styles.buSelectorIcon} />
                        </TouchableOpacity>
                        
                        {showDropdown && (
                            <View style={styles.dropdownContainer}>
                                <View style={styles.dropdownHeader}>
                                    <Typography variant="caption" weight="bold" color={colors.primary}>Filtrar por</Typography>
                                </View>
                                <TouchableOpacity
                                    style={[styles.dropdownOption, selectedBu === 'all' && styles.dropdownOptionSelected]}
                                    onPress={() => handleSelectBu('all')}
                                >
                                    <Typography style={styles.dropdownOptionText} weight="bold">Todos los locales</Typography>
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


