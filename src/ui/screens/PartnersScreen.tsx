import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, Modal, TextInput, Switch, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { theme } from '../theme';
import { Typography, Card, Input, Button } from '../components';
import { partnerRepository } from '../../infrastructure/repositories/partnerRepository';
import { formatNumber } from '../../application/utils/format';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PartnersScreen = () => {
    const router = useRouter();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [alias, setAlias] = useState('');
    const [percentage, setPercentage] = useState('50');
    const [role, setRole] = useState('Socio');
    const [isManaging, setIsManaging] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await (partnerRepository as any).getAll(true);
            setPartners(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

     const handleOpenModal = (p?: any) => {
          // Debug: console.log('[Partners] handleOpenModal called:', p?.id, p?.name, 'is_managing_partner:', p?.is_managing_partner, 'is_active:', p?.is_active);
          // Debug: console.log('[Partners] Current partners:', partners.map(p => ({ id: p.id, name: p.name, isManaging: p.is_managing_partner, isActive: p.is_active })));
         if (p) {
            setCurrentId(p.id);
            setName(p.name);
            setAlias(p.alias || '');
            setPercentage(String(p.participation_percentage));
            setRole(p.role);
            setIsManaging(p.is_managing_partner === true);
            setIsActive(p.is_active);
        } else {
            setCurrentId(null);
            setName('');
            setAlias('');
            setPercentage('0');
            setRole('Partner');
            setIsManaging(false);
            setIsActive(true);
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        // Debug: console.log('[Partners] handleSave called:', { currentId, name, isManaging, isActive });
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }

        try {
            const payload = {
                name,
                alias,
                participationPercentage: parseFloat(percentage) || 0,
                role,
                isManagingPartner: isManaging ? 1 : 0,
                isActive: isActive
            };
            // Debug: console.log('[Partners] Saving payload:', payload);

            if (currentId) {
                await (partnerRepository as any).update(currentId, payload);
                // Debug: console.log('[Partners] Update successful');
            } else {
                await (partnerRepository as any).create(payload);
                // Debug: console.log('[Partners] Create successful');
            }
            setModalVisible(false);
            loadData();
        } catch (error) {
            console.error('[Partners] Save error:', error);
            Alert.alert('Error', 'No se pudo guardar el socio.');
        }
    };

    const handleDelete = (id: string, active: boolean) => {
        const partner = partners.find(p => p.id === id);
        
        if (active === true) {
            // Verificar si es socio gerente
            if (partner?.is_managing_partner === true) {
                Alert.alert(
                    'No se puede dar de baja',
                    'No es posible dar de baja a un socio gerente. Primero transfiere el rol de gerencia a otro socio activo.',
                    [{ text: 'Entendido' }]
                );
                return;
            }
            
            Alert.alert('Confirmar Baja', '¿Deseas dar de baja a este socio? No podrá realizar nuevas operaciones.', [
                { text: 'Cancelar' },
                {
                    text: 'Dar de Baja', style: 'destructive', onPress: async () => {
                        await (partnerRepository as any).softDelete(id);
                        loadData();
                    }
                }
            ]);
        } else {
            // Verificar reactivación de socio gerente
            if (partner?.is_managing_partner === true) {
                const currentManagingPartner = partners.find(p => p.is_managing_partner === true && p.is_active === true);
                if (currentManagingPartner && currentManagingPartner.id !== id) {
                    Alert.alert(
                        'No se puede reactivar',
                        `Ya existe un socio gerente activo (${currentManagingPartner.name}). No se puede reactivar a otro socio gerente simultáneamente.`,
                        [{ text: 'Entendido' }]
                    );
                    return;
                }
            }
            
            Alert.alert('Reactivar', '¿Deseas reactivar a este socio?', [
                { text: 'Cancelar' },
                {
                    text: 'Reactivar', onPress: async () => {
                        await (partnerRepository as any).reactivate(id);
                        loadData();
                    }
                }
            ]);
        }
    };

    const handleManagingToggle = (newValue: boolean) => {
        // Debug: console.log('[Partners] handleManagingToggle called:', { 
        //     newValue, 
        //     currentId, 
        //     partnersCount: partners.length,
        //     partners: partners.map(p => ({ id: p.id, name: p.name, isManaging: p.is_managing_partner, isActive: p.is_active }))
        // });
        
        const currentManagingPartner = partners.find(p => p.is_managing_partner === true && p.is_active === true);
        const activePartners = partners.filter(p => p.is_active === true);
        const otherActivePartners = activePartners.filter(p => p.id !== currentId);
        // Debug: console.log('[Partners] currentManagingPartner:', currentManagingPartner?.id, currentManagingPartner?.name);
        // Debug: console.log('[Partners] activePartners:', activePartners.length, 'otherActivePartners:', otherActivePartners.length);
        
        if (newValue === true) {
            // Activating this partner as managing
            if (currentManagingPartner && currentManagingPartner.id !== currentId) {
                Alert.alert(
                    'Cambio de Socio Gerente',
                    `Actualmente ${currentManagingPartner.name} es el socio gerente. ¿Transferir la responsabilidad gerencial a este socio?`,
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Transferir', onPress: () => {
                            // Debug: console.log('[Partners] Transferir pressed, setting isManaging to true');
                            setIsManaging(true);
                        } }
                    ]
                );
                return;
            }
        } else {
            // Deactivating managing role - Verificar si es el único socio gerente activo
            if (currentManagingPartner && currentManagingPartner.id === currentId) {
                // Es el socio gerente actual intentando desactivar el rol
                if (otherActivePartners.length === 0) {
                    Alert.alert(
                        'No se puede remover',
                        'Es el único socio activo en el sistema. No se puede quitar el rol de socio gerente.',
                        [{ text: 'Entendido' }]
                    );
                    return;
                } else {
                    Alert.alert(
                        'Remover Socio Gerente',
                        '¿Estás seguro de quitar el rol de socio gerente? Debes asignar el rol a otro socio activo primero.',
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Transferir a otro socio', onPress: () => {
                                // Mostrar lista de socios activos para transferir
                                const partnerNames = otherActivePartners.map(p => p.name).join(', ');
                                Alert.alert(
                                    'Transferir Gerencia',
                                    `Selecciona otro socio activo para transferir la gerencia: ${partnerNames}\n\nVe a editar el socio deseado y activa "Socio Administrador".`,
                                    [{ text: 'Entendido' }]
                                );
                            }},
                            { text: 'Remover igual', style: 'destructive', onPress: () => {
                                  // Debug: console.log('[Partners] Remover igual pressed, setting isManaging to false');
                                 setIsManaging(false);
                             } }
                        ]
                    );
                    return;
                }
            }
        }
        
        // If no confirmation needed, set directly
        // Debug: console.log('[Partners] No confirmation needed, setting isManaging to:', newValue);
        setIsManaging(newValue);
    };

    const renderItem = ({ item }: { item: any }) => (
        <Card style={[styles.itemCard, item.is_active === false && styles.inactiveCard]}>
            <View style={styles.itemInfo}>
                <View style={styles.nameRow}>
                     <Typography weight="bold" color={item.is_active === false ? colors.textMuted : colors.text}>
                        {item.name}
                    </Typography>
                    {item.is_managing_partner === true && item.is_active === true && (
                        <View style={styles.adminBadge}>
                            <Typography variant="caption" color="#fff" style={{ fontSize: 10 }}>ADMIN</Typography>
                        </View>
                    )}
                    {item.is_active === false && (
                        <View style={styles.inactiveBadge}>
                            <Typography variant="caption" color="#fff" style={{ fontSize: 10 }}>BAJA</Typography>
                        </View>
                    )}
                </View>
                <Typography variant="caption" color={colors.textSecondary}>
                    {item.role} • {formatNumber(item.participation_percentage, 1)}% particip.
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

    const styles = useMemo(() => StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        container: { flex: 1, padding: theme.spacing.md },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
            paddingTop: Platform.OS === 'ios' ? 0 : 10
        },
        backButton: {
            marginRight: theme.spacing.md,
            marginLeft: -4,
            padding: 4
        },
        list: { paddingBottom: 100 },
        itemCard: { padding: theme.spacing.md, marginBottom: 12 },
        inactiveCard: { opacity: 0.6, backgroundColor: colors.background },
        itemInfo: { flex: 1, marginBottom: 12 },
        nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        adminBadge: { backgroundColor: colors.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
        inactiveBadge: { backgroundColor: colors.textMuted, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
        itemActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
        actionBtn: { marginRight: 24 },
        addBtn: { position: 'absolute', bottom: insets.bottom + 20, left: 20, right: 20 },
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', padding: 20 },
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
        switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 10 },
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
                        <Typography variant="h1">Socios</Typography>
                        <Typography variant="body" color={colors.textSecondary}>Gestión de socios</Typography>
                    </View>
                </View>

                <FlatList
                    data={partners}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={loadData}
                />

                <Button
                    title="Agregar Socio"
                    onPress={() => handleOpenModal()}
                    style={styles.addBtn}
                />

                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                            <View style={styles.modalContent}>
                                <Typography variant="h2" style={{ marginBottom: 20 }}>
                                    {currentId ? 'Editar Socio' : 'Nuevo Socio'}
                                </Typography>

                                <Typography variant="label">Nombre Completo</Typography>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Ej: Juan Pérez"
                                    placeholderTextColor={colors.textMuted}
                                />

                                <Typography variant="label">Alias / Nombre Corto</Typography>
                                <TextInput
                                    style={styles.input}
                                    value={alias}
                                    onChangeText={setAlias}
                                    placeholder="Ej: Juan"
                                    placeholderTextColor={colors.textMuted}
                                />

                                <Typography variant="label">% de Participación</Typography>
                                <TextInput
                                    style={styles.input}
                                    value={percentage}
                                    onChangeText={setPercentage}
                                    keyboardType="numeric"
                                />

                                <Typography variant="label">Rol en la empresa</Typography>
                                <TextInput
                                    style={styles.input}
                                    value={role}
                                    onChangeText={setRole}
                                    placeholder="Ej: Socio Gerente"
                                    placeholderTextColor={colors.textMuted}
                                />

                                <View style={styles.switchRow}>
                                    <View style={{ flex: 1 }}>
                                        <Typography weight="bold">Socio Administrador</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>
                                            Puede realizar retiros y cierres de caja.
                                        </Typography>
                                    </View>
                                     <Switch
                                         value={isManaging}
                                         onValueChange={(value) => {
                                              // Debug: console.log('[Partners] Switch onValueChange fired:', value, 'currentId:', currentId);
                                             handleManagingToggle(value);
                                         }}
                                         trackColor={{ false: colors.border, true: colors.primary + '80' }}
                                         thumbColor={isManaging ? colors.primary : '#f4f3f4'}
                                          disabled={isActive === false}
                                     />
                                     {isActive === false && (
                                        <Typography variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
                                            El socio debe estar activo para ser administrador
                                        </Typography>
                                    )}
                                </View>

                                <View style={styles.modalButtons}>
                                    <Button title="Cancelar" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
                                    <View style={{ width: 10 }} />
                                    <Button title="Guardar" onPress={handleSave} style={{ flex: 1 }} />
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

