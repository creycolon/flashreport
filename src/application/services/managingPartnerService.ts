import { partnerRepository } from '../../infrastructure/repositories/partnerRepository';
import { configRepository } from '../../infrastructure/repositories/configRepository';

export const managingPartnerService = {
    /**
     * Obtiene el socio gerente actual desde la configuración
     */
    getCurrentManagingPartner: async () => {
        try {
            // 1. Obtener ID desde configuración
            const managingPartnerId = await (configRepository as any).get('managing_partner_id', '');
            
            if (!managingPartnerId) {
                console.log('[ManagingPartner] No managing partner configured');
                return null;
            }
            
            // 2. Obtener información del socio
            const partner = await (partnerRepository as any).getById(managingPartnerId);
            
            if (!partner) {
                console.warn(`[ManagingPartner] Configured partner ${managingPartnerId} not found`);
                return null;
            }
            
            // 3. Verificar que sea socio gerente activo
            if (!partner.is_active || !partner.is_managing_partner) {
                console.warn(`[ManagingPartner] Partner ${managingPartnerId} is not active managing partner`);
                return null;
            }
            
            return partner;
        } catch (error) {
            console.error('[ManagingPartner] Error getting current managing partner:', error);
            return null;
        }
    },
    
    /**
     * Cambia el socio gerente a otro socio
     * @param newPartnerId ID del nuevo socio gerente
     * @returns Objeto con éxito y mensaje
     */
    changeManagingPartner: async (newPartnerId: string) => {
        try {
            console.log(`[ManagingPartner] Changing managing partner to: ${newPartnerId}`);
            
            // 1. Validar nuevo socio
            const newPartner = await (partnerRepository as any).getById(newPartnerId);
            
            if (!newPartner) {
                return {
                    success: false,
                    message: `Socio con ID ${newPartnerId} no encontrado`
                };
            }
            
            if (!newPartner.is_active) {
                return {
                    success: false,
                    message: `Socio ${newPartner.name} no está activo`
                };
            }
            
            // 2. Obtener socio gerente actual
            const currentPartnerId = await (configRepository as any).get('managing_partner_id', '');
            
            if (!currentPartnerId) {
                console.warn('[ManagingPartner] No current managing partner configured');
            }
            
            // 3. Actualizar roles en la base de datos
            // Primero, establecer el nuevo socio como managing partner
            await (partnerRepository as any).update(newPartnerId, {
                name: newPartner.name,
                alias: newPartner.alias,
                participationPercentage: newPartner.participation_percentage,
                role: newPartner.role,
                isManagingPartner: true,
                isActive: newPartner.is_active
            });
            
            // 4. Si hay un socio gerente actual y es diferente al nuevo, quitarle el rol
            if (currentPartnerId && currentPartnerId !== newPartnerId) {
                const currentPartner = await (partnerRepository as any).getById(currentPartnerId);
                if (currentPartner) {
                    await (partnerRepository as any).update(currentPartnerId, {
                        name: currentPartner.name,
                        alias: currentPartner.alias,
                        participationPercentage: currentPartner.participation_percentage,
                        role: currentPartner.role,
                        isManagingPartner: false,
                        isActive: currentPartner.is_active
                    });
                    console.log(`[ManagingPartner] Removed managing role from previous partner: ${currentPartner.name}`);
                }
            }
            
            // 5. Garantizar que solo un socio tenga is_managing_partner = 1
            await (partnerRepository as any)._ensureSingleManagingPartner(newPartnerId);
            
            // 6. Actualizar configuración
            await (configRepository as any).set('managing_partner_id', newPartnerId);
            
            console.log(`[ManagingPartner] Successfully changed managing partner to: ${newPartner.name} (${newPartnerId})`);
            
            return {
                success: true,
                message: `Socio gerente cambiado a ${newPartner.name}`,
                oldPartnerId: currentPartnerId,
                newPartnerId: newPartnerId,
                newPartnerName: newPartner.name
            };
            
        } catch (error) {
            console.error('[ManagingPartner] Error changing managing partner:', error);
            return {
                success: false,
                message: `Error al cambiar socio gerente: ${error instanceof Error ? error.message : 'Error desconocido'}`
            };
        }
    },
    
    /**
     * Obtiene la lista de socios activos que podrían ser gerentes
     * (excluyendo el socio gerente actual si se especifica)
     */
    getEligiblePartners: async (excludeCurrent = true) => {
        try {
            const partners = await (partnerRepository as any).getAll(true);
            
            // Filtrar solo socios activos
            const activePartners = partners.filter((p: any) => !!p.is_active);
            
            if (excludeCurrent) {
                const currentId = await (configRepository as any).get('managing_partner_id', '');
                return activePartners.filter((p: any) => p.id !== currentId);
            }
            
            return activePartners;
        } catch (error) {
            console.error('[ManagingPartner] Error getting eligible partners:', error);
            return [];
        }
    },
    
    /**
     * Verifica si un socio puede ser gerente (está activo y existe)
     */
    validatePartnerForManagement: async (partnerId: string) => {
        try {
            const partner = await (partnerRepository as any).getById(partnerId);
            
            if (!partner) {
                return {
                    isValid: false,
                    message: 'Socio no encontrado'
                };
            }
            
            if (!partner.is_active) {
                return {
                    isValid: false,
                    message: 'Socio no está activo'
                };
            }
            
            return {
                isValid: true,
                message: 'Socio válido',
                partner: partner
            };
        } catch (error) {
            console.error('[ManagingPartner] Error validating partner:', error);
            return {
                isValid: false,
                message: 'Error validando socio'
            };
        }
    }
};