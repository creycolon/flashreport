import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button, Card } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';

export interface BusinessUnit {
    id: string;
    name: string;
    location?: string;
    color: string;
    display_order: number;
    is_active: boolean;
}

export interface BusinessUnitsEnhancedProps {
    businessUnits: BusinessUnit[];
    loading?: boolean;
    onRefresh?: () => void;
    onEdit?: (businessUnit: BusinessUnit) => void;
    onToggleActive?: (id: string, isActive: boolean) => void;
    onAddNew?: () => void;
    onSave?: (businessUnit: Omit<BusinessUnit, 'id'> & { id?: string }) => Promise<void> | void;
    onCancel?: () => void;
}

const COLOR_PALETTE = ['#38ff14', '#ffc107', '#2196f3', '#e91e63', '#9c27b0', '#ff5722', '#795548', '#607d8b'];

export const BusinessUnitsEnhanced: React.FC<BusinessUnitsEnhancedProps> = ({
    businessUnits,
    loading = false,
    onRefresh,
    onEdit,
    onToggleActive,
    onAddNew,
    onSave,
    onCancel,
}) => {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = React.useState(false);
    const [editingUnit, setEditingUnit] = React.useState<BusinessUnit | null>(null);
    const [name, setName] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [color, setColor] = React.useState(COLOR_PALETTE[0]);
    const [order, setOrder] = React.useState('0');
    const [isActive, setIsActive] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    const handleOpenModal = (unit?: BusinessUnit) => {
        if (unit) {
            setEditingUnit(unit);
            setName(unit.name);
            setLocation(unit.location || '');
            setColor(unit.color);
            setOrder(String(unit.display_order));
            setIsActive(unit.is_active);
        } else {
            setEditingUnit(null);
            setName('');
            setLocation('');
            setColor(COLOR_PALETTE[0]);
            setOrder(String(businessUnits.length + 1));
            setIsActive(true);
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            // In a real app, show error toast
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name,
                location,
                color,
                display_order: parseInt(order) || 0,
                is_active: isActive
            };

            if (editingUnit) {
                await onSave?.({ ...payload, id: editingUnit.id });
            } else {
                await onSave?.(payload);
            }
            setModalVisible(false);
        } catch (error) {
            console.error('Error saving business unit:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        onCancel?.();
    };

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
        title: {
            color: colors.text,
            fontSize: theme.typography.sizes.xl,
            fontWeight: 'bold',
        },
        subtitle: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.sm,
            marginTop: theme.spacing.xs,
        },
        addButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.spacing.borderRadius.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.md,
        },
        unitCard: {
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.lg,
            padding: theme.spacing.lg,
            ...(Platform.OS === 'web' ? { width: '30%', minWidth: 280 } : { width: '100%' }),
        },
        unitHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.md,
        },
        unitInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        colorIndicator: {
            width: 16,
            height: 16,
            borderRadius: 8,
        },
        unitName: {
            color: colors.text,
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
        },
        inactiveBadge: {
            backgroundColor: colors.textMuted,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.spacing.borderRadius.full,
        },
        inactiveText: {
            color: '#fff',
            fontSize: theme.typography.sizes.xs,
            fontWeight: 'bold',
        },
        unitDetails: {
            marginTop: theme.spacing.sm,
        },
        detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xs,
        },
        detailLabel: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.xs,
            fontWeight: '500',
            minWidth: 60,
        },
        detailValue: {
            color: colors.text,
            fontSize: theme.typography.sizes.sm,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border + '30',
            paddingTop: theme.spacing.md,
        },
        actionButton: {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.spacing.borderRadius.md,
            backgroundColor: colors.surfaceLight,
        },
        actionText: {
            color: colors.primary,
            fontSize: theme.typography.sizes.xs,
            fontWeight: 'bold',
        },
        dangerActionText: {
            color: colors.danger,
        },
        successActionText: {
            color: colors.success,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        modalContent: {
            backgroundColor: colors.surface,
            borderRadius: theme.spacing.borderRadius.xl,
            padding: theme.spacing.xl,
            width: Platform.OS === 'web' ? 500 : '100%',
            maxWidth: '100%',
        },
        modalHeader: {
            marginBottom: theme.spacing.lg,
        },
        modalTitle: {
            color: colors.text,
            fontSize: theme.typography.sizes.xl,
            fontWeight: 'bold',
        },
        input: {
            backgroundColor: colors.background,
            color: colors.text,
            padding: theme.spacing.md,
            borderRadius: theme.spacing.borderRadius.md,
            fontSize: theme.typography.sizes.md,
            marginBottom: theme.spacing.lg,
            marginTop: theme.spacing.xs,
        },
        colorPicker: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.sm,
            marginBottom: theme.spacing.lg,
        },
        colorCircle: {
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: 'transparent',
        },
        activeColor: {
            borderColor: colors.text,
        },
        modalActions: {
            flexDirection: 'row',
            gap: theme.spacing.md,
            marginTop: theme.spacing.lg,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Typography>Loading business units...</Typography>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Typography style={styles.title}>Locales</Typography>
                    <Typography style={styles.subtitle}>
                        {businessUnits.length} {businessUnits.length === 1 ? 'local' : 'locales'} registrados
                    </Typography>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => onAddNew ? onAddNew() : handleOpenModal()}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Typography color="#fff" weight="bold">
                        Agregar Local
                    </Typography>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View style={styles.grid}>
                    {businessUnits.map((unit) => (
                        <Card key={unit.id} style={styles.unitCard}>
                            <View style={styles.unitHeader}>
                                <View style={styles.unitInfo}>
                                    <View style={[styles.colorIndicator, { backgroundColor: unit.color }]} />
                                    <Typography style={styles.unitName}>
                                        {unit.name}
                                    </Typography>
                                </View>
                                {!unit.is_active && (
                                    <View style={styles.inactiveBadge}>
                                        <Typography style={styles.inactiveText}>
                                            BAJA
                                        </Typography>
                                    </View>
                                )}
                            </View>

                            <View style={styles.unitDetails}>
                                <View style={styles.detailRow}>
                                    <Typography style={styles.detailLabel}>Ubicación:</Typography>
                                    <Typography style={styles.detailValue}>
                                        {unit.location || 'Sin ubicación'}
                                    </Typography>
                                </View>
                                <View style={styles.detailRow}>
                                    <Typography style={styles.detailLabel}>Orden:</Typography>
                                    <Typography style={styles.detailValue}>
                                        {unit.display_order}
                                    </Typography>
                                </View>
                                <View style={styles.detailRow}>
                                    <Typography style={styles.detailLabel}>Estado:</Typography>
                                    <Typography style={styles.detailValue}>
                                        {unit.is_active ? 'Activo' : 'Inactivo'}
                                    </Typography>
                                </View>
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => onEdit ? onEdit(unit) : handleOpenModal(unit)}
                                >
                                    <Typography style={styles.actionText}>
                                        EDITAR
                                    </Typography>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => onToggleActive?.(unit.id, unit.is_active)}
                                >
                                    <Typography style={[
                                        styles.actionText,
                                        unit.is_active ? styles.dangerActionText : styles.successActionText
                                    ]}>
                                        {unit.is_active ? 'DAR DE BAJA' : 'REACTIVAR'}
                                    </Typography>
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))}
                </View>
            </ScrollView>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Typography style={styles.modalTitle}>
                                {editingUnit ? 'Editar Local' : 'Nuevo Local'}
                            </Typography>
                        </View>

                        <Typography variant="label">Nombre del Local</Typography>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ej: Puesto Norte"
                            placeholderTextColor={colors.textMuted}
                        />

                        <Typography variant="label">Ubicación (Opcional)</Typography>
                        <TextInput
                            style={styles.input}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Ej: Sucursal Centro"
                            placeholderTextColor={colors.textMuted}
                        />

                        <Typography variant="label">Orden de Visualización</Typography>
                        <TextInput
                            style={styles.input}
                            value={order}
                            onChangeText={setOrder}
                            keyboardType="numeric"
                        />

                        <Typography variant="label">Color Distintivo</Typography>
                        <View style={styles.colorPicker}>
                            {COLOR_PALETTE.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.activeColor]}
                                    onPress={() => setColor(c)}
                                />
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <Button
                                title="Cancelar"
                                variant="outline"
                                onPress={handleCloseModal}
                                style={{ flex: 1 }}
                            />
                            <Button
                                title={saving ? "Guardando..." : "Guardar"}
                                onPress={handleSave}
                                style={{ flex: 1 }}
                                disabled={saving}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Example usage component for easy testing
export const BusinessUnitsEnhancedExamples: React.FC = () => {
    const [units, setUnits] = React.useState<BusinessUnit[]>([
        {
            id: '1',
            name: 'Puesto Norte',
            location: 'Sucursal Centro',
            color: '#38ff14',
            display_order: 1,
            is_active: true,
        },
        {
            id: '2',
            name: 'Puesto Sur',
            location: 'Sucursal Sur',
            color: '#2196f3',
            display_order: 2,
            is_active: true,
        },
        {
            id: '3',
            name: 'Puesto Este',
            location: 'Sucursal Este',
            color: '#e91e63',
            display_order: 3,
            is_active: false,
        },
    ]);

    const handleToggleActive = (id: string, isActive: boolean) => {
        setUnits(prev => prev.map(unit =>
            unit.id === id ? { ...unit, is_active: !isActive } : unit
        ));
    };

    const handleSave = async (unit: Omit<BusinessUnit, 'id'> & { id?: string }) => {
        if (unit.id) {
            // Update existing
            setUnits(prev => prev.map(u =>
                u.id === unit.id ? { ...u, ...unit } : u
            ));
        } else {
            // Add new
            const newUnit = {
                ...unit,
                id: Date.now().toString(),
            } as BusinessUnit;
            setUnits(prev => [...prev, newUnit]);
        }
    };

    return (
        <BusinessUnitsEnhanced
            businessUnits={units}
            onToggleActive={handleToggleActive}
            onSave={handleSave}
        />
    );
};