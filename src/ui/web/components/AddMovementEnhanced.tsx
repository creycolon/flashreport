import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button, Card } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';

export interface BusinessUnitOption {
    id: string;
    name: string;
    color: string;
}

export interface Category {
    id: string;
    name: string;
    type: 'CR' | 'DB';
}

export interface AddMovementEnhancedProps {
    businessUnits: BusinessUnitOption[];
    categories: Category[];
    loading?: boolean;
    onSubmit?: (movement: {
        businessUnitId: string;
        type: 'CR' | 'DB';
        categoryId: string;
        amount: number;
        description: string;
        date: Date;
    }) => Promise<void> | void;
    onCancel?: () => void;
}

export const AddMovementEnhanced: React.FC<AddMovementEnhancedProps> = ({
    businessUnits,
    categories,
    loading = false,
    onSubmit,
    onCancel,
}) => {
    const { colors } = useTheme();
    const [type, setType] = React.useState<'CR' | 'DB'>('CR');
    const [categoryId, setCategoryId] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [selectedBu, setSelectedBu] = React.useState('');
    const [showBuDropdown, setShowBuDropdown] = React.useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
    const [date, setDate] = React.useState<Date>(new Date());
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (businessUnits.length > 0 && !selectedBu) {
            setSelectedBu(businessUnits[0].id);
        }
    }, [businessUnits]);

    React.useEffect(() => {
        const filteredCategories = categories.filter(cat => cat.type === type);
        if (filteredCategories.length > 0 && !categoryId) {
            setCategoryId(filteredCategories[0].id);
        }
    }, [categories, type]);

    const handleSubmit = async () => {
        if (!amount || !categoryId || !selectedBu) {
            // In a real app, show error toast
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit?.({
                businessUnitId: selectedBu,
                type,
                categoryId,
                amount: amountNum,
                description,
                date,
            });
            // Reset form
            setAmount('');
            setDescription('');
            setDate(new Date());
        } catch (error) {
            console.error('Error submitting movement:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedBusinessUnit = businessUnits.find(bu => bu.id === selectedBu);
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    const filteredCategories = categories.filter(cat => cat.type === type);

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
        formCard: {
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.lg,
            padding: theme.spacing.xl,
        },
        typeSelector: {
            flexDirection: 'row',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.lg,
        },
        typeButton: {
            flex: 1,
            padding: theme.spacing.lg,
            borderRadius: theme.spacing.borderRadius.lg,
            borderWidth: 2,
            borderColor: colors.border,
            alignItems: 'center',
        },
        typeButtonActiveCredit: {
            borderColor: colors.success,
            backgroundColor: colors.success + '10',
        },
        typeButtonActiveDebit: {
            borderColor: colors.danger,
            backgroundColor: colors.danger + '10',
        },
        typeIcon: {
            marginBottom: theme.spacing.sm,
        },
        typeLabel: {
            fontSize: theme.typography.sizes.md,
            fontWeight: 'bold',
        },
        formRow: {
            marginBottom: theme.spacing.lg,
        },
        label: {
            color: colors.text,
            fontSize: theme.typography.sizes.sm,
            fontWeight: '600',
            marginBottom: theme.spacing.sm,
        },
        input: {
            backgroundColor: colors.background,
            color: colors.text,
            padding: theme.spacing.md,
            borderRadius: theme.spacing.borderRadius.md,
            fontSize: theme.typography.sizes.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        selectorButton: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.md,
            padding: theme.spacing.md,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        selectorText: {
            color: colors.text,
            fontSize: theme.typography.sizes.md,
        },
        selectorPlaceholder: {
            color: colors.textMuted,
        },
        dropdown: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.md,
            marginTop: theme.spacing.xs,
            zIndex: 1000,
            maxHeight: 300,
            ...(Platform.OS === 'web' && {
                overflowY: 'auto',
            }),
        },
        dropdownItem: {
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + '30',
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        dropdownItemSelected: {
            backgroundColor: colors.primary + '20',
        },
        colorIndicator: {
            width: 12,
            height: 12,
            borderRadius: 6,
        },
        categoryChips: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.sm,
        },
        categoryChip: {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.spacing.borderRadius.full,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
        },
        categoryChipActive: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '10',
        },
        categoryChipText: {
            color: colors.text,
            fontSize: theme.typography.sizes.sm,
            fontWeight: '500',
        },
        categoryChipTextActive: {
            color: colors.primary,
            fontWeight: 'bold',
        },
        amountInputContainer: {
            position: 'relative',
        },
        amountPrefix: {
            position: 'absolute',
            left: theme.spacing.md,
            top: theme.spacing.md,
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.md,
            fontWeight: 'bold',
        },
        amountInput: {
            backgroundColor: colors.background,
            color: colors.text,
            padding: theme.spacing.md,
            paddingLeft: theme.spacing.xl * 2,
            borderRadius: theme.spacing.borderRadius.md,
            fontSize: theme.typography.sizes.xl,
            fontWeight: 'bold',
            borderWidth: 1,
            borderColor: colors.border,
            textAlign: 'right',
        },
        actions: {
            flexDirection: 'row',
            gap: theme.spacing.md,
            marginTop: theme.spacing.xl,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        formSection: {
            marginBottom: theme.spacing.xl,
            paddingBottom: theme.spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + '30',
        },
        lastSection: {
            marginBottom: 0,
            paddingBottom: 0,
            borderBottomWidth: 0,
        },
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Typography>Loading form data...</Typography>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Typography style={styles.title}>Nuevo Movimiento</Typography>
                <Typography style={styles.subtitle}>
                    Registra un nuevo ingreso o egreso de caja
                </Typography>
            </View>

            <ScrollView>
                <View style={styles.formCard}>
                    <View style={styles.formSection}>
                        <Typography style={styles.label}>Tipo de Movimiento</Typography>
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    type === 'CR' && styles.typeButtonActiveCredit,
                                ]}
                                onPress={() => setType('CR')}
                            >
                                <Ionicons
                                    name="arrow-up-circle"
                                    size={32}
                                    color={type === 'CR' ? colors.success : colors.textSecondary}
                                    style={styles.typeIcon}
                                />
                                <Typography
                                    style={styles.typeLabel}
                                    color={type === 'CR' ? colors.success : colors.textSecondary}
                                >
                                    INGRESO
                                </Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    Entrada de efectivo
                                </Typography>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    type === 'DB' && styles.typeButtonActiveDebit,
                                ]}
                                onPress={() => setType('DB')}
                            >
                                <Ionicons
                                    name="arrow-down-circle"
                                    size={32}
                                    color={type === 'DB' ? colors.danger : colors.textSecondary}
                                    style={styles.typeIcon}
                                />
                                <Typography
                                    style={styles.typeLabel}
                                    color={type === 'DB' ? colors.danger : colors.textSecondary}
                                >
                                    EGRESO
                                </Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    Salida de efectivo
                                </Typography>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Typography style={styles.label}>Local</Typography>
                        <View style={{ position: 'relative' }}>
                            <TouchableOpacity
                                style={styles.selectorButton}
                                onPress={() => setShowBuDropdown(!showBuDropdown)}
                            >
                                {selectedBusinessUnit ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                                        <View
                                            style={[styles.colorIndicator, { backgroundColor: selectedBusinessUnit.color }]}
                                        />
                                        <Typography style={styles.selectorText}>
                                            {selectedBusinessUnit.name}
                                        </Typography>
                                    </View>
                                ) : (
                                    <Typography style={[styles.selectorText, styles.selectorPlaceholder]}>
                                        Seleccionar local
                                    </Typography>
                                )}
                                <Ionicons
                                    name={showBuDropdown ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                            {showBuDropdown && (
                                <View style={styles.dropdown}>
                                    {businessUnits.map((bu) => (
                                        <TouchableOpacity
                                            key={bu.id}
                                            style={[
                                                styles.dropdownItem,
                                                selectedBu === bu.id && styles.dropdownItemSelected,
                                            ]}
                                            onPress={() => {
                                                setSelectedBu(bu.id);
                                                setShowBuDropdown(false);
                                            }}
                                        >
                                            <View
                                                style={[styles.colorIndicator, { backgroundColor: bu.color }]}
                                            />
                                            <Typography style={styles.selectorText}>
                                                {bu.name}
                                            </Typography>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Typography style={styles.label}>Categoría</Typography>
                        <View style={styles.categoryChips}>
                            {filteredCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryChip,
                                        categoryId === cat.id && styles.categoryChipActive,
                                    ]}
                                    onPress={() => setCategoryId(cat.id)}
                                >
                                    <Typography
                                        style={[
                                            styles.categoryChipText,
                                            categoryId === cat.id && styles.categoryChipTextActive,
                                        ]}
                                    >
                                        {cat.name}
                                    </Typography>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Typography style={styles.label}>Monto</Typography>
                        <View style={styles.amountInputContainer}>
                            <Typography style={styles.amountPrefix}>$</Typography>
                            <TextInput
                                style={styles.amountInput}
                                value={amount}
                                onChangeText={setAmount}
                                placeholder="0.00"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Typography style={styles.label}>Descripción (Opcional)</Typography>
                        <TextInput
                            style={styles.input}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Ej: Venta al contado, pago a proveedor, etc."
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.lastSection}>
                        <Typography style={styles.label}>Fecha y Hora</Typography>
                        <TouchableOpacity
                            style={styles.selectorButton}
                            onPress={() => {
                                // In a real app, show date picker
                                const newDate = new Date();
                                setDate(newDate);
                            }}
                        >
                            <Typography style={styles.selectorText}>
                                {date.toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Typography>
                            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actions}>
                        {onCancel && (
                            <Button
                                title="Cancelar"
                                variant="outline"
                                onPress={onCancel}
                                style={{ flex: 1 }}
                            />
                        )}
                        <Button
                            title={submitting ? "Guardando..." : "Registrar Movimiento"}
                            onPress={handleSubmit}
                            style={{ flex: 1 }}
                            disabled={submitting || !amount || !categoryId || !selectedBu}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

// Example usage component for easy testing
export const AddMovementEnhancedExamples: React.FC = () => {
    const [businessUnits] = React.useState<BusinessUnitOption[]>([
        { id: '1', name: 'Puesto Norte', color: '#38ff14' },
        { id: '2', name: 'Puesto Sur', color: '#2196f3' },
        { id: '3', name: 'Puesto Este', color: '#e91e63' },
    ]);

    const [categories] = React.useState<Category[]>([
        { id: '1', name: 'Venta Contado', type: 'CR' },
        { id: '2', name: 'Venta Crédito', type: 'CR' },
        { id: '3', name: 'Otros Ingresos', type: 'CR' },
        { id: '4', name: 'Compra Mercadería', type: 'DB' },
        { id: '5', name: 'Gastos Operativos', type: 'DB' },
        { id: '6', name: 'Sueldos', type: 'DB' },
    ]);

    const handleSubmit = async (movement: any) => {
        console.log('Submitting movement:', movement);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Movimiento registrado exitosamente!');
    };

    return (
        <AddMovementEnhanced
            businessUnits={businessUnits}
            categories={categories}
            onSubmit={handleSubmit}
        />
    );
};