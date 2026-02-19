import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@ui/shared/theme';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { Typography, Input, Button, Card } from '@ui/shared/components';
import { businessUnitRepository } from '@core/infrastructure/repositories/businessUnitRepository';
import { categoryRepository } from '@core/infrastructure/repositories/categoryRepository';
import { cashMovementRepository } from '@core/infrastructure/repositories/cashMovementRepository';
import DateTimePicker from '@react-native-community/datetimepicker';

export const AddMovementScreen = () => {
    const [type, setType] = useState<'CR' | 'DB'>('CR');
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedBu, setSelectedBu] = useState('');
    const [bus, setBus] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [minDate, setMinDate] = useState<Date | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const { colors } = useTheme();

    const styles = useMemo(() => StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        container: { flex: 1 },
        content: { 
            padding: theme.spacing.md,
            overflow: 'visible',
            position: 'relative',
        },
         header: { marginBottom: theme.spacing.lg },
         tabContainer: { flexDirection: 'row', marginBottom: theme.spacing.lg, gap: theme.spacing.md },
         tab: { flex: 1, height: 45, borderRadius: theme.spacing.borderRadius.md, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
         activeTabCredit: { backgroundColor: colors.success, borderColor: colors.success },
         activeTabDebit: { backgroundColor: colors.danger, borderColor: colors.danger },
         formCard: { 
             padding: theme.spacing.lg,
             overflow: 'visible',
             position: 'relative',
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
                borderBottomColor: colors.primary + '40',
                backgroundColor: colors.primary + '20',
            },
          categoryRow: { marginTop: theme.spacing.xs, marginBottom: theme.spacing.lg },
        catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginRight: theme.spacing.sm },
        catChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
        dateInput: { height: 50, backgroundColor: colors.surface, borderRadius: theme.spacing.borderRadius.md, paddingHorizontal: theme.spacing.md, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: theme.spacing.md, marginTop: theme.spacing.xs },
    }), [colors]);

    useEffect(() => { loadInitialData(); }, []);
    useEffect(() => { if (type) loadCategories(type); }, [type]);

    const loadInitialData = async () => {
        const buList = await businessUnitRepository.getAll();
        setBus(buList);
        if (buList.length > 0) setSelectedBu(buList[0].id);
    };

    const loadCategories = async (movementType: 'CR' | 'DB') => {
        const catList = await categoryRepository.getByType(movementType);
        setCategories(catList);
        if (catList.length > 0) setCategoryId(catList[0].id);
    };

    const loadLastMovementDate = async (businessUnitId: string) => {
        try {
            const lastMovement = await cashMovementRepository.getLastMovementForBU(businessUnitId);
            if (lastMovement?.transaction_date) {
                const lastDate = new Date(lastMovement.transaction_date);
                setMinDate(lastDate);
                if (date < lastDate) setDate(lastDate);
            } else {
                setMinDate(null);
            }
        } catch (error) {
            console.error('Error cargando última fecha:', error);
            setMinDate(null);
        }
    };

    useEffect(() => { if (selectedBu) loadLastMovementDate(selectedBu); }, [selectedBu]);

    const showDatepicker = async () => {
        console.log('[AddMovement] Showing date picker for Platform:', Platform.OS);
        
        if (Platform.OS === 'android') {
            // Usar DateTimePickerAndroid para evitar el bug de dismiss
            const { DateTimePickerAndroid } = require('@react-native-community/datetimepicker');
            try {
                await DateTimePickerAndroid.open({
                    value: date,
                    mode: 'datetime',
                    minimumDate: minDate || undefined,
                    is24Hour: true,
                    onChange: (event: any, selectedDate?: Date) => {
                        if (event.type === 'set' && selectedDate) {
                            if (minDate && selectedDate < minDate) {
                                Alert.alert('Fecha inválida', `La fecha no puede ser anterior al último movimiento registrado (${formatDate(minDate)})`);
                                return;
                            }
                            setDate(selectedDate);
                        }
                    },
                });
            } catch (error) {
                console.error('[AddMovement] Error with Android date picker:', error);
            }
        } else {
            setShowDatePicker(true);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        console.log('[AddMovement] iOS date picker event:', event, 'selectedDate:', selectedDate);
        setShowDatePicker(false);
        
        if (event?.type === 'dismissed' || !selectedDate) {
            return;
        }
        
        if (minDate && selectedDate < minDate) {
            Alert.alert('Fecha inválida', `La fecha no puede ser anterior al último movimiento registrado (${formatDate(minDate)})`);
            return;
        }
        
        setDate(selectedDate);
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleSave = async () => {
        console.log('[AddMovement] Starting save process...');
        
        if (!amount || !categoryId || !selectedBu) {
            Alert.alert('Error', 'Por favor completa los campos obligatorios');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            Alert.alert('Error', 'Por favor ingresa un monto válido mayor a 0');
            return;
        }

        setLoading(true);
        try {
            await cashMovementRepository.create({
                businessUnitId: selectedBu,
                type: type,
                categoryId: categoryId,
                amount: amountNum,
                description: description,
                date: date.toISOString(),
                createdBy: 'p1',
            });

            console.log('[AddMovement] Movement saved successfully');
            Alert.alert('Éxito', 'Movimiento registrado correctamente');
            
            setAmount('');
            setDescription('');
            setDate(new Date());
            
        } catch (error) {
            console.error('[AddMovement] Error saving movement:', error);
            Alert.alert('Error', 'No se pudo guardar el movimiento: ' + ((error as Error).message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const getSelectedBuName = () => {
        if (!selectedBu) return 'Seleccionar local';
        const bu = bus.find(b => b.id === selectedBu);
        return bu ? bu.name : 'Local no encontrado';
    };

    const getSelectedBu = () => {
        if (!selectedBu) return null;
        return bus.find(b => b.id === selectedBu);
    };

    const handleSelectBu = (buId: string) => {
        setSelectedBu(buId);
        setShowDropdown(false);
    };

    return (
        <View style={styles.safe}>
            <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
                <View style={styles.header}>
                    <Typography variant="h1">Caja Cierres</Typography>
                </View>

                <View style={styles.tabContainer}>
                     <TouchableOpacity style={[styles.tab, type === 'CR' && styles.activeTabCredit]} onPress={() => setType('CR')}>
                         <Typography variant="body" weight="bold" color={type === 'CR' ? colors.text : colors.textSecondary}>INGRESO</Typography>
                    </TouchableOpacity>
                     <TouchableOpacity style={[styles.tab, type === 'DB' && styles.activeTabDebit]} onPress={() => setType('DB')}>
                         <Typography variant="body" weight="bold" color={type === 'DB' ? colors.text : colors.textSecondary}>EGRESO</Typography>
                    </TouchableOpacity>
                </View>

                <Card variant="flat" style={styles.formCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Typography variant="label" style={{ marginRight: 8 }}>🏪 Unidad de Negocio</Typography>
                        <View style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                            
                            {/* <Typography variant="caption" weight="bold" color={colors.primary}>PRINCIPAL</Typography>
                             */}
                        </View>
                    </View>
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
                                    <Typography variant="caption" weight="bold" color={colors.primary}>🏪 Seleccionar Unidad de Negocio</Typography>
                                </View>
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

                    <Typography variant="label" style={{ marginTop: theme.spacing.md }}>Categoría</Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
                        {categories.map(cat => (
                            <TouchableOpacity key={cat.id} style={[styles.catChip, categoryId === cat.id && styles.catChipActive]} onPress={() => setCategoryId(cat.id)}>
                                <Typography variant="caption" color={categoryId === cat.id ? colors.primary : colors.textSecondary}>{cat.name}</Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Input label="Monto ($)" placeholder="0,00" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                    <Input label="Descripción" placeholder="Ej: Cierre de turno mañana" value={description} onChangeText={setDescription} multiline />

                    <Typography variant="label">Fecha</Typography>
                    <TouchableOpacity onPress={showDatepicker}>
                        <View style={styles.dateInput}>
                            <Typography variant="body">{formatDate(date)}</Typography>
                            <Typography variant="caption" color={colors.textMuted}>Toque para editar</Typography>
                        </View>
                    </TouchableOpacity>
                    {minDate && <Typography variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>Último movimiento: {formatDate(minDate)}</Typography>}

                    {showDatePicker && Platform.OS === 'ios' && (
                        <View style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 8, marginBottom: theme.spacing.md }}>
                            <DateTimePicker value={date} mode="datetime" display="spinner" onChange={handleDateChange} minimumDate={minDate || undefined} is24Hour={true} locale="es-ES" />
                            <Button title="Cerrar" variant="outline" onPress={() => setShowDatePicker(false)} />
                        </View>
                    )}

                    <Button title="Guardar Movimiento" onPress={handleSave} loading={loading} />
                 </Card>


             </ScrollView>
        </View>
    );
};
