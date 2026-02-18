import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Typography, Input, Button, Card } from '../components';
import { theme } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { managingPartnerService } from '../../application/services/managingPartnerService';
import { partnerRepository } from '../../infrastructure/repositories/partnerRepository';

interface ManagePartnerModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: (newPartnerId: string, newPartnerName: string) => void;
}

export const ManagePartnerModal: React.FC<ManagePartnerModalProps> = ({
    visible,
    onClose,
    onSuccess
}) => {
    const { colors } = useTheme();
    // Debug: console.log('[ManagePartnerModal] colors:', { 
    //     text: colors.text, 
    //     background: colors.background, 
    //     cardBackground: colors.cardBackground,
    //     textSecondary: colors.textSecondary 
    // });
    const [step, setStep] = useState<'input' | 'confirm'>('input');
    const [partnerId, setPartnerId] = useState('');
    const [partnerInfo, setPartnerInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [currentManagingPartner, setCurrentManagingPartner] = useState<any>(null);
    const [eligiblePartners, setEligiblePartners] = useState<any[]>([]);
    
    const styles = StyleSheet.create({
        modalBackground: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.lg
        },
        modalContent: {
            backgroundColor: colors.cardBackground,
            borderRadius: theme.spacing.borderRadius.lg,
            width: '100%',
            maxWidth: 400,
            maxHeight: '80%',
            overflow: 'hidden'
        },
        modalHeader: {
            padding: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border
        },
        modalBody: {
            padding: theme.spacing.lg
        },
        modalFooter: {
            padding: theme.spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            flexDirection: 'row',
            gap: theme.spacing.md
        },
        partnerCard: {
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.md,
            marginBottom: theme.spacing.md
        },
        partnerCardActive: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '10'
        },
        eligiblePartnerItem: {
            padding: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + '40',
            flexDirection: 'row',
            alignItems: 'center'
        },
        eligiblePartnerId: {
            width: 60,
            fontFamily: 'monospace',
            color: colors.text,
            fontWeight: '600'
        },
        partnerStatusIndicator: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 8
        },
        partnerStatusActive: {
            backgroundColor: colors.success
        },
        partnerStatusInactive: {
            backgroundColor: colors.danger
        },
        partnerIdLabel: {
            fontFamily: 'monospace',
            backgroundColor: colors.primary + '10',
            color: colors.text,
            fontWeight: 'bold',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            alignSelf: 'flex-start'
        },
        errorText: {
            color: colors.danger,
            marginTop: theme.spacing.sm
        },
        infoText: {
            color: colors.textMuted,
            marginTop: theme.spacing.sm
        }
    });
    
    useEffect(() => {
        if (visible) {
            loadCurrentManagingPartner();
            loadEligiblePartners();
            resetForm();
        }
    }, [visible]);
    
    const loadCurrentManagingPartner = async () => {
        try {
            const partner = await managingPartnerService.getCurrentManagingPartner();
            setCurrentManagingPartner(partner);
        } catch (error) {
            console.error('Error loading current managing partner:', error);
        }
    };
    
    const loadEligiblePartners = async () => {
        try {
            const partners = await managingPartnerService.getEligiblePartners(true);
            setEligiblePartners(partners);
        } catch (error) {
            console.error('Error loading eligible partners:', error);
        }
    };
    
    const resetForm = () => {
        setStep('input');
        setPartnerId('');
        setPartnerInfo(null);
        setLoading(false);
    };
    
    const handlePartnerIdChange = (text: string) => {
        // Limpiar el ID (solo letras y números)
        const cleanId = text.trim().toLowerCase();
        setPartnerId(cleanId);
    };
    
    const handleValidatePartner = async () => {
        if (!partnerId.trim()) {
            Alert.alert('Error', 'Por favor ingresa el número de socio');
            return;
        }
        
        setLoading(true);
        try {
            const validation = await managingPartnerService.validatePartnerForManagement(partnerId);
            
            if (!validation.isValid) {
                Alert.alert('Socio Inválido', validation.message);
                setPartnerInfo(null);
                return;
            }
            
            setPartnerInfo(validation.partner);
            setStep('confirm');
            
        } catch (error) {
            console.error('Error validating partner:', error);
            Alert.alert('Error', 'No se pudo validar el socio');
        } finally {
            setLoading(false);
        }
    };
    
    const handleConfirmChange = async () => {
        if (!partnerInfo) return;
        
        setLoading(true);
        try {
            const result = await managingPartnerService.changeManagingPartner(partnerInfo.id);
            
            if (result.success) {
                Alert.alert('Éxito', result.message);
                if (onSuccess && result.newPartnerId && result.newPartnerName) {
                    onSuccess(result.newPartnerId, result.newPartnerName);
                }
                onClose();
                resetForm();
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            console.error('Error changing managing partner:', error);
            Alert.alert('Error', 'No se pudo cambiar el socio gerente');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSelectPartner = (partner: any) => {
        setPartnerId(partner.id);
        setPartnerInfo(partner);
        setStep('confirm');
    };
    
    const renderInputStep = () => (
        <>
             <Typography variant="body" color={colors.text} style={{ marginBottom: theme.spacing.md }}>
                 Ingresa el número del nuevo socio gerente. El socio debe estar activo.
             </Typography>
            
            {currentManagingPartner && (
                <Card style={styles.partnerCard}>
                     <Typography variant="caption" color={colors.textMuted}>Socio Gerente Actual</Typography>
                     <Typography variant="h3">{currentManagingPartner.name}</Typography>
                     <Typography variant="body" color={colors.text}>
                         ID: <Typography variant="body" style={styles.partnerIdLabel}>{currentManagingPartner.id}</Typography>
                     </Typography>
                </Card>
            )}
            
            <Input
                label="Número de Socio"
                placeholder="Ej: p1, p2, p3..."
                value={partnerId}
                onChangeText={handlePartnerIdChange}
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={{ marginBottom: theme.spacing.md }}
            />
            
            <Button
                title="Validar Socio"
                onPress={handleValidatePartner}
                loading={loading}
                disabled={!partnerId.trim()}
                style={{ marginBottom: theme.spacing.md }}
            />
            
            {eligiblePartners.length > 0 && (
                <View style={{ marginTop: theme.spacing.lg }}>
                     <Typography variant="label" color={colors.text} style={{ marginBottom: theme.spacing.sm }}>
                         Socios Activos Disponibles
                     </Typography>
                    <ScrollView style={{ maxHeight: 200 }}>
                        {eligiblePartners.map(partner => (
                            <TouchableOpacity
                                key={partner.id}
                                style={styles.eligiblePartnerItem}
                                onPress={() => handleSelectPartner(partner)}
                            >
                                 <View style={{ flexDirection: 'row', alignItems: 'center', width: 70 }}>
                                      <View style={[
                                          styles.partnerStatusIndicator,
                                          partner.is_active === true ? styles.partnerStatusActive : styles.partnerStatusInactive
                                      ]} />
                                     <Typography variant="body" style={styles.eligiblePartnerId}>
                                         {partner.id}
                                     </Typography>
                                 </View>
                                 <View style={{ flex: 1 }}>
                                     <Typography variant="body">{partner.name}</Typography>
                                     {partner.alias && (
                                         <Typography variant="caption" color={colors.textMuted}>
                                             {partner.alias}
                                         </Typography>
                                     )}
                                      <Typography variant="caption" color={partner.is_active === true ? colors.success : colors.danger}>
                                          {partner.is_active === true ? 'Activo' : 'Inactivo'}
                                      </Typography>
                                 </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </>
    );
    
    const renderConfirmStep = () => (
        <>
             <Typography variant="body" color={colors.text} style={{ marginBottom: theme.spacing.lg }}>
                 ¿Confirmas el cambio de socio gerente?
             </Typography>
            
            <Card style={[styles.partnerCard, styles.partnerCardActive]}>
                 <Typography variant="caption" color={colors.textMuted}>Nuevo Socio Gerente</Typography>
                 <Typography variant="h3">{partnerInfo?.name}</Typography>
                 <Typography variant="body" color={colors.text}>
                     ID: <Typography variant="body" style={styles.partnerIdLabel}>{partnerInfo?.id}</Typography>
                 </Typography>
                 {partnerInfo?.alias && (
                     <Typography variant="body" color={colors.text}>
                         Alias: {partnerInfo.alias}
                     </Typography>
                 )}
                 <Typography variant="body" color={colors.text}>
                     Porcentaje: {partnerInfo?.participation_percentage}%
                 </Typography>
            </Card>
            
            {currentManagingPartner && (
                <Card style={styles.partnerCard}>
                     <Typography variant="caption" color={colors.textMuted}>Socio Gerente Anterior</Typography>
                     <Typography variant="h3">{currentManagingPartner.name}</Typography>
                     <Typography variant="body" color={colors.text}>
                         ID: <Typography variant="body" style={styles.partnerIdLabel}>{currentManagingPartner.id}</Typography>
                     </Typography>
                     <Typography variant="body" color={colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
                         Este socio pasará a ser socio regular (Partner)
                     </Typography>
                </Card>
            )}
            
            <Typography variant="caption" color={colors.warning} style={{ marginTop: theme.spacing.md }}>
                ⚠️ Solo el socio gerente puede realizar ciertas operaciones del sistema.
            </Typography>
        </>
    );
    
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Typography variant="h2">
                            {step === 'input' ? 'Cambiar Socio Gerente' : 'Confirmar Cambio'}
                        </Typography>
                    </View>
                    
                    <View style={styles.modalBody}>
                        {step === 'input' ? renderInputStep() : renderConfirmStep()}
                    </View>
                    
                    <View style={styles.modalFooter}>
                        <Button
                            title="Cancelar"
                            variant="outline"
                            onPress={() => {
                                if (step === 'confirm') {
                                    setStep('input');
                                } else {
                                    onClose();
                                    resetForm();
                                }
                            }}
                            style={{ flex: 1 }}
                        />
                        
                        {step === 'confirm' && (
                            <Button
                                title="Confirmar Cambio"
                                onPress={handleConfirmChange}
                                loading={loading}
                                style={{ flex: 1 }}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};