import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { formatCurrency, formatDate } from '@core/application/utils/format';
import { useBusinessUnitName } from '@ui/shared/useBusinessUnitName';

export interface Movement {
    id: string;
    date: Date;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    businessUnit?: string;
    pointOfSale?: string;
    status?: 'pending' | 'completed' | 'cancelled';
}

export interface MovementsTableEnhancedProps {
    movements: Movement[];
    onRowPress?: (movement: Movement) => void;
    onEdit?: (movement: Movement) => void;
    onDelete?: (movement: Movement) => void;
    loading?: boolean;
}

const getStatusColor = (type: 'credit' | 'debit', colors: any) => {
    return type === 'credit' ? colors.success : colors.danger;
};

const getStatusText = (type: 'credit' | 'debit') => {
    return type === 'credit' ? 'Crédito' : 'Débito';
};

export const MovementsTableEnhanced: React.FC<MovementsTableEnhancedProps> = ({
    movements,
    onRowPress,
    onEdit,
    onDelete,
    loading = false,
}) => {
    const { colors } = useTheme();
    const { businessUnitName } = useBusinessUnitName();

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.xl,
            overflow: 'hidden',
            flex: 1,
        },
        tableHeader: {
            flexDirection: 'row',
            backgroundColor: colors.surfaceLight,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
        },
        headerCell: {
            flex: 1,
            paddingHorizontal: theme.spacing.sm,
        },
        headerText: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.xs,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        row: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: colors.border + '30',
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            alignItems: 'center',
        },
        cell: {
            flex: 1,
            paddingHorizontal: theme.spacing.sm,
        },
        cellText: {
            color: colors.text,
            fontSize: theme.typography.sizes.sm,
            fontWeight: '500',
        },
        amountCell: {
            alignItems: 'flex-end',
        },
        amountBadge: {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.spacing.borderRadius.lg,
            minWidth: 100,
            alignItems: 'center',
        },
        statusIndicator: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: theme.spacing.sm,
        },
        businessUnitCell: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        emptyState: {
            padding: theme.spacing.xl,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyText: {
            color: colors.textSecondary,
            marginTop: theme.spacing.md,
        },
        actionsCell: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: theme.spacing.sm,
        },
        actionButton: {
            padding: theme.spacing.xs,
            borderRadius: theme.spacing.borderRadius.sm,
            backgroundColor: colors.surfaceLight,
        },
    });

    const columns = [
        { key: 'date', label: 'Fecha', width: 1 },
        { key: 'description', label: 'Descripción', width: 2 },
        { key: 'businessUnit', label: businessUnitName, width: 1.5 },
        { key: 'pointOfSale', label: 'Punto de Venta', width: 1.5 },
        { key: 'amount', label: 'Monto', width: 1.2 },
        { key: 'actions', label: '', width: 1 },
    ];

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Ionicons name="refresh" size={32} color={colors.textSecondary} />
                    <Typography style={styles.emptyText}>Cargando movimientos...</Typography>
                </View>
            </View>
        );
    }

    if (movements.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
                    <Typography variant="h3" color={colors.textSecondary}>
                        No hay movimientos
                    </Typography>
                    <Typography style={styles.emptyText}>
                        No se encontraron movimientos para los filtros seleccionados.
                    </Typography>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
                {columns.map((col) => (
                    <View key={col.key} style={[styles.headerCell, { flex: col.width }]}>
                        <Typography style={styles.headerText}>
                            {col.label}
                        </Typography>
                    </View>
                ))}
            </View>

            {/* Table Body */}
            <ScrollView>
                {movements.map((movement) => {
                    const statusColor = getStatusColor(movement.type, colors);
                    const amountColor = movement.type === 'credit' ? colors.success : colors.danger;
                    
                    return (
                        <TouchableOpacity
                            key={movement.id}
                            style={styles.row}
                            onPress={() => onRowPress?.(movement)}
                            activeOpacity={0.7}
                        >
                            {/* Date */}
                            <View style={[styles.cell, { flex: columns[0].width }]}>
                                <Typography style={styles.cellText}>
                                    {movement.date ? formatDate(movement.date.toISOString()) : ''}
                                </Typography>
                            </View>
                            
                            {/* Description */}
                            <View style={[styles.cell, { flex: columns[1].width }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                                    <Typography style={styles.cellText}>
                                        {movement.description}
                                    </Typography>
                                </View>
                            </View>
                            
                            {/* Business Unit */}
                            <View style={[styles.cell, { flex: columns[2].width }]}>
                                <Typography style={styles.cellText}>
                                    {movement.businessUnit || 'N/A'}
                                </Typography>
                            </View>
                            
                            {/* Point of Sale */}
                            <View style={[styles.cell, { flex: columns[3].width }]}>
                                <Typography style={styles.cellText}>
                                    {movement.pointOfSale || 'N/A'}
                                </Typography>
                            </View>
                            
                            {/* Amount */}
                            <View style={[styles.cell, styles.amountCell, { flex: columns[4].width }]}>
                                <View style={[styles.amountBadge, { backgroundColor: amountColor + '20' }]}>
                                    <Typography
                                        weight="bold"
                                        color={amountColor}
                                    >
                                        {movement.type === 'credit' ? '+' : '-'} {formatCurrency(Math.abs(movement.amount))}
                                    </Typography>
                                </View>
                            </View>
                            
                            {/* Actions */}
                            <View style={[styles.cell, styles.actionsCell, { flex: columns[5].width }]}>
                                {onEdit && (
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => onEdit(movement)}
                                    >
                                        <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                                {onDelete && (
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => onDelete(movement)}
                                    >
                                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

// Example usage component
export const MovementsTableEnhancedExample: React.FC = () => {
    const mockMovements: Movement[] = [
        {
            id: '1',
            date: new Date('2025-02-18'),
            description: 'Venta Terminal A',
            amount: 12450.00,
            type: 'credit',
            businessUnit: 'Retail Norte',
            pointOfSale: 'POS-1042-S',
        },
        {
            id: '2',
            date: new Date('2025-02-18'),
            description: 'Retiro de efectivo',
            amount: 2140.50,
            type: 'debit',
            businessUnit: 'Logística Centro',
            pointOfSale: 'TRM-055-C',
        },
        {
            id: '3',
            date: new Date('2025-02-17'),
            description: 'Venta Terminal C',
            amount: 8920.00,
            type: 'credit',
            businessUnit: 'Distribución',
            pointOfSale: 'POS-2291-N',
        },
        {
            id: '4',
            date: new Date('2025-02-17'),
            description: 'Pago proveedor',
            amount: 3500.75,
            type: 'debit',
            businessUnit: 'Administración',
            pointOfSale: 'OFFICE-001',
        },
    ];

    return (
        <MovementsTableEnhanced
            movements={mockMovements}
            onRowPress={(movement) => console.log('Pressed', movement)}
            onEdit={(movement) => console.log('Edit', movement)}
            onDelete={(movement) => console.log('Delete', movement)}
        />
    );
};