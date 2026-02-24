import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Modal, TextInput, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button, Card } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';

export interface Partner {
    id: string;
    name: string;
    alias?: string;
    participation_percentage: number;
    role: string;
    is_managing_partner: boolean;
    is_active: boolean;
}

export interface PartnersEnhancedProps {
    partners: Partner[];
    loading?: boolean;
    onRefresh?: () => void;
    onEdit?: (partner: Partner) => void;
    onToggleActive?: (id: string, isActive: boolean) => void;
    onToggleManaging?: (id: string, isManaging: boolean) => void;
    onAddNew?: () => void;
    onSave?: (partner: Omit<Partner, 'id'> & { id?: string }) => Promise<void> | void;
    onCancel?: () => void;
    onBack?: () => void;
    onManageBusinessUnits?: () => void;
}

export const PartnersEnhanced: React.FC<PartnersEnhancedProps> = ({
    partners,
    loading = false,
    onRefresh,
    onEdit,
    onToggleActive,
    onToggleManaging,
    onAddNew,
    onSave,
    onCancel,
    onBack,
    onManageBusinessUnits,
}) => {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = React.useState(false);
    const [editingPartner, setEditingPartner] = React.useState<Partner | null>(null);
    const [name, setName] = React.useState('');
    const [alias, setAlias] = React.useState('');
    const [percentage, setPercentage] = React.useState('50');
    const [role, setRole] = React.useState('Socio');
    const [isManaging, setIsManaging] = React.useState(false);
    const [isActive, setIsActive] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
    const [selectedPartner, setSelectedPartner] = React.useState<Partner | null>(null);
    const [showActionsModal, setShowActionsModal] = React.useState(false);

    const handleMenuAction = (partner: Partner) => {
        setSelectedPartner(partner);
        setMenuOpenId(null);
        setShowActionsModal(true);
    };

    const handleOpenModal = (partner?: Partner) => {
        if (partner) {
            setEditingPartner(partner);
            setName(partner.name);
            setAlias(partner.alias || '');
            setPercentage(String(partner.participation_percentage));
            setRole(partner.role);
            setIsManaging(partner.is_managing_partner);
            setIsActive(partner.is_active);
        } else {
            setEditingPartner(null);
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
        if (!name.trim()) {
            // In a real app, show error toast
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name,
                alias,
                participation_percentage: parseFloat(percentage) || 0,
                role,
                is_managing_partner: isManaging,
                is_active: isActive
            };

            if (editingPartner) {
                await onSave?.({ ...payload, id: editingPartner.id });
            } else {
                await onSave?.(payload);
            }
            setModalVisible(false);
        } catch (error) {
            console.error('Error saving partner:', error);
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
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
        },
        backButton: {
            padding: 4,
            marginRight: theme.spacing.sm,
        },
        headerContent: {
            flex: 1,
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
        partnerCard: {
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.lg,
            padding: theme.spacing.lg,
            zIndex: 1,
            ...(Platform.OS === 'web' ? { width: '30%', minWidth: 280 } : { width: '100%' }),
        },
        partnerHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.md,
        },
        partnerInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        partnerAvatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
        },
        partnerName: {
            color: colors.text,
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
        },
        managingBadge: {
            backgroundColor: colors.success + '20',
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.spacing.borderRadius.full,
        },
        managingText: {
            color: colors.success,
            fontSize: theme.typography.sizes.xs,
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
        partnerDetails: {
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
            minWidth: 80,
        },
        detailValue: {
            color: colors.text,
            fontSize: theme.typography.sizes.sm,
        },
        percentageBadge: {
            backgroundColor: colors.primary + '10',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.spacing.borderRadius.full,
        },
        percentageText: {
            color: colors.primary,
            fontSize: theme.typography.sizes.sm,
            fontWeight: 'bold',
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: theme.spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border + '30',
            paddingTop: theme.spacing.md,
        },
        menuButton: {
            padding: theme.spacing.sm,
            borderRadius: theme.spacing.borderRadius.md,
        },
        menuDropdown: {
            position: 'absolute',
            right: 0,
            top: 40,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.md,
            paddingVertical: theme.spacing.xs,
            minWidth: 180,
            zIndex: 100,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            minHeight: 44,
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
        actionModalItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.lg,
            paddingHorizontal: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            minHeight: 56,
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
        switchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.lg,
        },
        switchLabel: {
            color: colors.text,
            fontSize: theme.typography.sizes.md,
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
                <Typography>Loading partners...</Typography>
            </View>
        );
    }

    const activePartners = partners.filter(p => p.is_active);
    const managingPartner = partners.find(p => p.is_managing_partner && p.is_active);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {onBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                )}
                <View style={[styles.headerContent, onBack && { marginLeft: 8 }]}>
                    <Typography style={styles.title}>Socios</Typography>
                    <Typography style={styles.subtitle}>
                        {partners.length} {partners.length === 1 ? 'socio' : 'socios'} registrados
                        {managingPartner && ` • Socio Gerente: ${managingPartner.name}`}
                    </Typography>
                </View>
                <Button
                    title={`+ Agregar Socio`}
                    onPress={() => onAddNew ? onAddNew() : handleOpenModal()}
                    style={{ backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8 }}
                />
            </View>

            <ScrollView>
                <View style={styles.grid}>
                    {partners.map((partner) => (
                        <Card key={partner.id} style={styles.partnerCard}>
                            <View style={styles.partnerHeader}>
                                <View style={styles.partnerInfo}>
                                    <View style={styles.partnerAvatar}>
                                        <Typography color={colors.primary} weight="bold">
                                            {partner.name.charAt(0).toUpperCase()}
                                        </Typography>
                                    </View>
                                    <View>
                                        <Typography style={styles.partnerName}>
                                            {partner.name}
                                        </Typography>
                                        {partner.alias && (
                                            <Typography variant="caption" color={colors.textSecondary}>
                                                {partner.alias}
                                            </Typography>
                                        )}
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                                    {partner.is_managing_partner && partner.is_active && (
                                        <View style={styles.managingBadge}>
                                            <Typography style={styles.managingText}>
                                                GERENTE
                                            </Typography>
                                        </View>
                                    )}
                                    {!partner.is_active && (
                                        <View style={styles.inactiveBadge}>
                                            <Typography style={styles.inactiveText}>
                                                BAJA
                                            </Typography>
                                        </View>
                                    )}
                                    <View style={{ position: 'relative', zIndex: 1 }}>
                                        <TouchableOpacity
                                            style={styles.menuButton}
                                            onPress={() => handleMenuAction(partner)}
                                        >
                                            <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.partnerDetails}>
                                <View style={styles.detailRow}>
                                    <Typography style={styles.detailLabel}>Rol:</Typography>
                                    <Typography style={styles.detailValue}>
                                        {partner.role}
                                    </Typography>
                                </View>
                                <View style={styles.detailRow}>
                                    <Typography style={styles.detailLabel}>Participación:</Typography>
                                    <View style={styles.percentageBadge}>
                                        <Typography style={styles.percentageText}>
                                            {partner.participation_percentage}%
                                        </Typography>
                                    </View>
                                </View>
                                <View style={styles.detailRow}>
                                    <Typography style={styles.detailLabel}>Estado:</Typography>
                                    <Typography style={styles.detailValue}>
                                        {partner.is_active ? 'Activo' : 'Inactivo'}
                                    </Typography>
                                </View>
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
                                {editingPartner ? 'Editar Socio' : 'Nuevo Socio'}
                            </Typography>
                        </View>

                        <Typography variant="label">Nombre Completo</Typography>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ej: Juan Pérez"
                            placeholderTextColor={colors.textMuted}
                        />

                        <Typography variant="label">Alias (Opcional)</Typography>
                        <TextInput
                            style={styles.input}
                            value={alias}
                            onChangeText={setAlias}
                            placeholder="Ej: JP"
                            placeholderTextColor={colors.textMuted}
                        />

                        <Typography variant="label">Porcentaje de Participación</Typography>
                        <TextInput
                            style={styles.input}
                            value={percentage}
                            onChangeText={setPercentage}
                            keyboardType="numeric"
                            placeholder="0-100"
                        />

                        <Typography variant="label">Rol</Typography>
                        <TextInput
                            style={styles.input}
                            value={role}
                            onChangeText={setRole}
                            placeholder="Ej: Socio, Administrador"
                        />

                        <View style={styles.switchRow}>
                            <Typography style={styles.switchLabel}>Socio Gerente</Typography>
                            <Switch
                                value={isManaging}
                                onValueChange={setIsManaging}
                                trackColor={{ false: colors.border, true: colors.success }}
                                thumbColor={isManaging ? colors.success : colors.textSecondary}
                            />
                        </View>

                        <View style={styles.switchRow}>
                            <Typography style={styles.switchLabel}>Activo</Typography>
                            <Switch
                                value={isActive}
                                onValueChange={setIsActive}
                                trackColor={{ false: colors.border, true: colors.success }}
                                thumbColor={isActive ? colors.success : colors.textSecondary}
                            />
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

            {/* Actions Modal */}
            <Modal visible={showActionsModal} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Typography style={styles.modalTitle}>
                                Acciones para {selectedPartner?.name}
                            </Typography>
                        </View>

                        <TouchableOpacity
                            style={styles.actionModalItem}
                            onPress={() => {
                                setShowActionsModal(false);
                                onEdit ? selectedPartner && onEdit(selectedPartner) : handleOpenModal(selectedPartner!);
                            }}
                        >
                            <Ionicons name="create-outline" size={24} color={colors.primary} />
                            <Typography style={{ marginLeft: 12, color: colors.text }}>Editar</Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionModalItem}
                            onPress={() => {
                                setShowActionsModal(false);
                                selectedPartner && onToggleManaging?.(selectedPartner.id, selectedPartner.is_managing_partner);
                            }}
                        >
                            <Ionicons name={selectedPartner?.is_managing_partner ? "person-remove-outline" : "person-add-outline"} size={24} color={colors.text} />
                            <Typography style={{ marginLeft: 12, color: colors.text }}>
                                {selectedPartner?.is_managing_partner ? 'Quitar Gerencia' : 'Asignar Gerencia'}
                            </Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionModalItem}
                            onPress={() => {
                                setShowActionsModal(false);
                                selectedPartner && onToggleActive?.(selectedPartner.id, selectedPartner.is_active);
                            }}
                        >
                            <Ionicons name={selectedPartner?.is_active ? "person-remove-outline" : "person-add-outline"} size={24} color={selectedPartner?.is_active ? colors.danger : colors.success} />
                            <Typography style={{ marginLeft: 12, color: selectedPartner?.is_active ? colors.danger : colors.success }}>
                                {selectedPartner?.is_active ? 'Dar de Baja' : 'Reactivar'}
                            </Typography>
                        </TouchableOpacity>

                        <Button
                            title="Cancelar"
                            variant="outline"
                            onPress={() => setShowActionsModal(false)}
                            style={{ marginTop: theme.spacing.lg }}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Example usage component for easy testing
export const PartnersEnhancedExamples: React.FC = () => {
    const [partners, setPartners] = React.useState<Partner[]>([
        {
            id: '1',
            name: 'Juan Pérez',
            alias: 'JP',
            participation_percentage: 60,
            role: 'Socio Gerente',
            is_managing_partner: true,
            is_active: true,
        },
        {
            id: '2',
            name: 'María García',
            alias: 'MG',
            participation_percentage: 40,
            role: 'Socio',
            is_managing_partner: false,
            is_active: true,
        },
        {
            id: '3',
            name: 'Carlos López',
            alias: 'CL',
            participation_percentage: 0,
            role: 'Colaborador',
            is_managing_partner: false,
            is_active: false,
        },
    ]);

    const handleToggleActive = (id: string, isActive: boolean) => {
        setPartners(prev => prev.map(partner =>
            partner.id === id ? { ...partner, is_active: !isActive } : partner
        ));
    };

    const handleToggleManaging = (id: string, isManaging: boolean) => {
        // Only one managing partner at a time
        setPartners(prev => prev.map(partner =>
            partner.id === id 
                ? { ...partner, is_managing_partner: !isManaging }
                : { ...partner, is_managing_partner: false } // Deactivate others
        ));
    };

    const handleSave = async (partner: Omit<Partner, 'id'> & { id?: string }) => {
        if (partner.id) {
            // Update existing
            setPartners(prev => prev.map(p =>
                p.id === partner.id ? { ...p, ...partner } : p
            ));
        } else {
            // Add new
            const newPartner = {
                ...partner,
                id: Date.now().toString(),
            } as Partner;
            setPartners(prev => [...prev, newPartner]);
        }
    };

    return (
        <PartnersEnhanced
            partners={partners}
            onToggleActive={handleToggleActive}
            onToggleManaging={handleToggleManaging}
            onSave={handleSave}
        />
    );
};