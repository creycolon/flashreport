import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Modal, TextInput, ScrollView, useWindowDimensions } from 'react-native';
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
    const { width: windowWidth } = useWindowDimensions();
    const isWebDesktop = Platform.OS === 'web' && windowWidth >= 1024;

    const [type, setType] = React.useState<'CR' | 'DB'>('CR');
    const [categoryId, setCategoryId] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [selectedBu, setSelectedBu] = React.useState('');
    const [showBuDropdown, setShowBuDropdown] = React.useState(false);
    const [showBuModal, setShowBuModal] = React.useState(false);
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
            padding: theme.spacing.md,
            flex: 1,
            ...(isWebDesktop && {
                maxWidth: Math.round(windowWidth * 0.5),
                minWidth: 400,
                alignSelf: 'center',
            }),
        },
        header: {
            marginBottom: theme.spacing.md,
        },
        title: {
            color: colors.text,
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
        },
        subtitle: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.xs,
            marginTop: theme.spacing.xs,
        },
        formCard: {
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.lg,
            padding: theme.spacing.md,
        },
        typeSelector: {
            flexDirection: 'row',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.sm,
        },
        typeButton: {
            flex: 1,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.spacing.borderRadius.md,
            borderWidth: 2,
            borderColor: colors.border,
            alignItems: 'center',
            minHeight: 60,
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
            marginBottom: theme.spacing.xs,
        },
        typeLabel: {
            fontSize: theme.typography.sizes.sm,
            fontWeight: 'bold',
        },
        formRow: {
            marginBottom: theme.spacing.md,
        },
        label: {
            color: colors.text,
            fontSize: theme.typography.sizes.xs,
            fontWeight: '600',
            marginBottom: theme.spacing.xs,
        },
        input: {
            backgroundColor: colors.background,
            color: colors.text,
            padding: theme.spacing.sm,
            borderRadius: theme.spacing.borderRadius.sm,
            fontSize: theme.typography.sizes.sm,
            borderWidth: 1,
            borderColor: colors.border,
        },
        selectorButton: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.sm,
            padding: theme.spacing.sm,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        selectorText: {
            color: colors.text,
            fontSize: theme.typography.sizes.sm,
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
            zIndex: 10001,
            maxHeight: 200,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
        },
        dropdownItem: {
            padding: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + '30',
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
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
            gap: theme.spacing.xs,
            marginTop: theme.spacing.xs,
        },
        categoryChip: {
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
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
            fontSize: theme.typography.sizes.xs,
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
            left: theme.spacing.sm,
            top: theme.spacing.sm,
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.sm,
            fontWeight: 'bold',
        },
        amountInput: {
            backgroundColor: colors.background,
            color: colors.text,
            padding: theme.spacing.sm,
            paddingLeft: theme.spacing.xl,
            borderRadius: theme.spacing.borderRadius.sm,
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
            borderWidth: 1,
            borderColor: colors.border,
            textAlign: 'right',
        },
        actions: {
            flexDirection: 'row',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.md,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.md,
        },
        formSection: {
            marginBottom: theme.spacing.md,
            paddingBottom: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + '30',
        },
        lastSection: {
            marginBottom: 0,
            paddingBottom: 0,
            borderBottomWidth: 0,
        },
        modalOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
        },
        modalContent: {
            backgroundColor: colors.surface,
            borderRadius: theme.spacing.borderRadius.lg,
            padding: theme.spacing.lg,
            width: '80%',
            maxWidth: 400,
            maxHeight: '60%',
        },
        modalTitle: {
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: theme.spacing.md,
            textAlign: 'center',
        },
        modalItem: {
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
        },
        modalItemText: {
            fontSize: theme.typography.sizes.md,
            color: colors.text,
            marginLeft: theme.spacing.sm,
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
                        <View style={{ position: 'relative', zIndex: Platform.OS !== 'web' ? 10000 : undefined }}>
                            <TouchableOpacity
                                style={styles.selectorButton}
                                onPress={() => Platform.OS === 'web' ? setShowBuModal(true) : setShowBuDropdown(!showBuDropdown)}
                            >
                                {selectedBusinessUnit ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                                        <View style={[styles.colorIndicator, { backgroundColor: selectedBusinessUnit.color }]} />
                                        <Typography style={styles.selectorText}>{selectedBusinessUnit.name}</Typography>
                                    </View>
                                ) : (
                                    <Typography style={[styles.selectorText, styles.selectorPlaceholder]}>Seleccionar local</Typography>
                                )}
                                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                            {Platform.OS !== 'web' && showBuDropdown && (
                                <View style={styles.dropdown}>
                                    {businessUnits.map((bu) => (
                                        <TouchableOpacity
                                            key={bu.id}
                                            style={[styles.dropdownItem, selectedBu === bu.id && styles.dropdownItemSelected]}
                                            onPress={() => { setSelectedBu(bu.id); setShowBuDropdown(false); }}
                                        >
                                            <View style={[styles.colorIndicator, { backgroundColor: bu.color }]} />
                                            <Typography style={styles.selectorText}>{bu.name}</Typography>
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

            {/* Modal para seleccionar negocio en web */}
            {Platform.OS === 'web' && showBuModal && (
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1}
                    onPress={() => setShowBuModal(false)}
                >
                    <TouchableOpacity 
                        style={styles.modalContent} 
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Typography style={styles.modalTitle}>Seleccionar Local</Typography>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {businessUnits.map((bu) => (
                                <TouchableOpacity
                                    key={bu.id}
                                    style={[styles.modalItem, selectedBu === bu.id && styles.dropdownItemSelected]}
                                    onPress={() => {
                                        setSelectedBu(bu.id);
                                        setShowBuModal(false);
                                    }}
                                >
                                    <View style={[styles.colorIndicator, { backgroundColor: bu.color }]} />
                                    <Typography style={styles.modalItemText}>{bu.name}</Typography>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            )}
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