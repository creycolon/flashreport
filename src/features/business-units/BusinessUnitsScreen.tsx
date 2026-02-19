import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, Modal, TextInput, Switch, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { Typography, Card, Input, Button } from '@ui/shared/components';
import { BusinessUnitsEnhanced } from '@ui/web/components';
import { businessUnitRepository } from '@core/infrastructure/repositories/businessUnitRepository';
import { formatNumber } from '@core/application/utils/format';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBusinessUnitName } from '@ui/shared/useBusinessUnitName';

const COLOR_PALETTE = ['#38ff14', '#ffc107', '#2196f3', '#e91e63', '#9c27b0', '#ff5722', '#795548', '#607d8b'];

export const BusinessUnitsScreen = () => {
    const router = useRouter();
    const { colors } = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isWebDesktop = Platform.OS === 'web' && windowWidth >= 1024;
    const { businessUnitName } = useBusinessUnitName();
    const [bus, setBus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [color, setColor] = useState(COLOR_PALETTE[0]);
    const [order, setOrder] = useState('0');
    const [isActive, setIsActive] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await (businessUnitRepository as any).getAll(true);
            setBus(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (bu?: any) => {
        if (bu) {
            setCurrentId(bu.id);
            setName(bu.name);
            setLocation(bu.location || '');
            setColor(bu.color);
            setOrder(String(bu.display_order || 0));
            setIsActive(bu.is_active);
        } else {
            setCurrentId(null);
            setName('');
            setLocation('');
            setColor(COLOR_PALETTE[0]);
            setOrder(String(bus.length + 1));
            setIsActive(true);
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }

        try {
            const payload = {
                name,
                location,
                color,
                displayOrder: parseInt(order) || 0,
                isActive: isActive
            };

            if (currentId) {
                await (businessUnitRepository as any).update(currentId, payload);
            } else {
                await (businessUnitRepository as any).create(payload);
            }
            setModalVisible(false);
            loadData();
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la unidad de negocio.');
        }
    };

    const handleDelete = (id: string, active: boolean) => {
        if (active === true) {
            Alert.alert('Confirmar Baja', '¿Deseas dar de baja este local? No aparecerá en las nuevas operaciones.', [
                { text: 'Cancelar' },
                {
                    text: 'Dar de Baja', style: 'destructive', onPress: async () => {
                        await (businessUnitRepository as any).softDelete(id);
                        loadData();
                    }
                }
            ]);
        } else {
            Alert.alert('Reactivar', '¿Deseas reactivar este local?', [
                { text: 'Cancelar' },
                {
                    text: 'Reactivar', onPress: async () => {
                        await (businessUnitRepository as any).reactivate(id);
                        loadData();
                    }
                }
            ]);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
         <Card style={[styles.itemCard, item.is_active === false && styles.inactiveCard]}>
            <View style={styles.itemInfo}>
                <View style={styles.nameRow}>
                    <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                     <Typography weight="bold" color={item.is_active === false ? colors.textMuted : colors.text}>
                        {item.name}
                    </Typography>
                     {item.is_active === false && (
                        <View style={styles.inactiveBadge}>
                            <Typography variant="caption" color="#fff" style={{ fontSize: 10 }}>BAJA</Typography>
                        </View>
                    )}
                </View>
                <Typography variant="caption" color={colors.textSecondary}>
                    {item.location || 'Sin ubicación'} • Orden: {item.display_order}
                </Typography>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleOpenModal(item)} style={styles.actionBtn}>
                    <Typography variant="caption" color={colors.primary} weight="bold">EDITAR</Typography>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.is_active)} style={styles.actionBtn}>
                     <Typography variant="caption" color={item.is_active === true ? colors.danger : colors.success} weight="bold">
                         {item.is_active === true ? 'BAJA' : 'ALTA'}
                     </Typography>
                </TouchableOpacity>
            </View>
        </Card>
    );

    // Enhanced web desktop version
    if (isWebDesktop) {
        const handleToggleActive = (id: string, isActive: boolean) => {
            handleDelete(id, isActive);
        };

        const handleSaveEnhanced = async (unit: any) => {
            const payload = {
                name: unit.name,
                location: unit.location,
                color: unit.color,
                displayOrder: unit.display_order,
                isActive: unit.is_active
            };

            try {
                if (unit.id) {
                    await (businessUnitRepository as any).update(unit.id, payload);
                } else {
                    await (businessUnitRepository as any).create(payload);
                }
                loadData();
            } catch (error) {
                Alert.alert('Error', 'No se pudo guardar la unidad de negocio.');
            }
        };

        const transformedBusinessUnits = bus.map(item => ({
            id: item.id,
            name: item.name,
            location: item.location || '',
            color: item.color,
            display_order: item.display_order || 0,
            is_active: item.is_active
        }));

        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={{ padding: theme.spacing.lg }}>
                    <BusinessUnitsEnhanced
                        businessUnits={transformedBusinessUnits}
                        loading={loading}
                        onRefresh={loadData}
                        onToggleActive={handleToggleActive}
                        onSave={handleSaveEnhanced}
                    />
                </View>
            </SafeAreaView>
        );
    }

    const styles = useMemo(() => StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        container: { 
            flex: 1, 
            paddingHorizontal: theme.spacing.md 
        },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
            paddingTop: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.lg
        },
        backButton: {
            marginRight: theme.spacing.md,
            marginLeft: -4,
            padding: 4
        },
        listContainer: { 
            flex: 1 
        },
        list: { 
            paddingBottom: theme.spacing.md 
        },
        itemCard: { padding: theme.spacing.md, marginBottom: 12 },
        inactiveCard: { opacity: 0.6, backgroundColor: colors.background },
        itemInfo: { flex: 1, marginBottom: 12 },
        nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        colorIndicator: { width: 10, height: 10, borderRadius: 5 },
        inactiveBadge: { backgroundColor: colors.textMuted, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
        itemActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
        actionBtn: { marginRight: 24 },
        buttonContainer: {
            paddingTop: theme.spacing.md,
            paddingBottom: Math.max(theme.spacing.md, insets.bottom),
            backgroundColor: colors.background
        },
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
        modalContent: { backgroundColor: colors.cardBackground, borderRadius: 16, padding: 24 },
        input: {
            backgroundColor: colors.background,
            color: colors.text,
            padding: 12,
            borderRadius: 8,
            fontSize: 16,
            marginBottom: 16,
            marginTop: 4
        },
        formRow: { flexDirection: 'row', gap: 10 },
        colorPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, marginBottom: 24 },
        colorCircle: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'transparent' },
         activeColor: { borderColor: colors.text },
        modalButtons: { flexDirection: 'row' }
    }), [colors, insets]);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Typography variant="h1">{businessUnitName}s</Typography>
                        <Typography variant="body" color={colors.textSecondary}>Gestión de {businessUnitName.toLowerCase()}s</Typography>
                    </View>
                </View>

                <FlatList
                    style={styles.listContainer}
                    data={bus}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={loadData}
                />

                <View style={styles.buttonContainer}>
                    <Button
                        title={`Agregar ${businessUnitName}`}
                        onPress={() => handleOpenModal()}
                    />
                </View>

                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Typography variant="h2" style={{ marginBottom: 20 }}>
                                {currentId ? `Editar ${businessUnitName}` : `Nuevo ${businessUnitName}`}
                            </Typography>

                            <Typography variant="label">Nombre del {businessUnitName}</Typography>
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

                            <View style={styles.formRow}>
                                <View style={{ flex: 1 }}>
                                    <Typography variant="label">Orden</Typography>
                                    <TextInput
                                        style={styles.input}
                                        value={order}
                                        onChangeText={setOrder}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

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

                            <View style={styles.modalButtons}>
                                <Button title="Cancelar" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
                                <View style={{ width: 10 }} />
                                <Button title="Guardar" onPress={handleSave} style={{ flex: 1 }} />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

