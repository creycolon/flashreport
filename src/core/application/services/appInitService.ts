import { partnerRepository } from '@core/infrastructure/repositories/partnerRepository';
import { businessUnitRepository } from '@core/infrastructure/repositories/businessUnitRepository';
import { categoryRepository } from '@core/infrastructure/repositories/categoryRepository';
import { configRepository } from '@core/infrastructure/repositories/configRepository';

export const appInitService = {
    /**
     * Verifica que exista un nombre para las unidades de negocio configurado
     * Si no existe, establece "Negocio" como valor por defecto
     */
    ensureBusinessUnitName: async (): Promise<boolean> => {
        try {
            const businessUnitName = await (configRepository as any).get('business_unit_name', '');
            
            if (!businessUnitName) {
                await (configRepository as any).set('business_unit_name', 'Negocio');
                console.log('[AppInit] Nombre de unidad de negocio configurado por defecto: Negocio');
            }
            
            return true;
        } catch (error) {
            console.error('[AppInit] Error al configurar nombre de unidad de negocio:', error);
            return false;
        }
    },

    /**
     * Verifica que exista un socio gerente configurado en app_config
     * Si no existe, asigna el socio p1 (o el primer socio activo) como gerente
     * Garantiza que el socio gerente esté activo y tenga is_managing_partner = 1
     */
    ensureDefaultManagingPartner: async (): Promise<boolean> => {
        try {
            // Debug: console.log('[AppInit] Verificando socio gerente desde configuración...');
            
            // 1. Obtener managing partner ID desde app_config
            const managingPartnerId = await (configRepository as any).get('managing_partner_id', '');
            // Debug: console.log(`[AppInit] managing_partner_id en config: ${managingPartnerId || '(vacío)'}`);
            
            // 2. Obtener todos los socios activos
            const partners = await (partnerRepository as any).getAll(true);
            // Debug: console.log(`[AppInit] Socios encontrados: ${partners.length}`);
            
            let targetPartner = null;
            
            // 3. Si hay managing partner configurado, validarlo
            if (managingPartnerId) {
                targetPartner = partners.find((p: any) => p.id === managingPartnerId);
                
                if (targetPartner) {
                     // Debug: console.log(`[AppInit] Socio gerente configurado encontrado: ${targetPartner.name} (${targetPartner.id})`);
                    
                    // Verificar que esté activo
                    if (!targetPartner.is_active) {
                        console.warn('[AppInit] Socio gerente configurado está INACTIVO. Reactivando...');
                        try {
                            await (partnerRepository as any).update(targetPartner.id, {
                                name: targetPartner.name,
                                alias: targetPartner.alias,
                                participationPercentage: targetPartner.participation_percentage,
                                role: targetPartner.role,
                                isManagingPartner: targetPartner.is_managing_partner,
                                isActive: true
                            });
                             // Debug: console.log('[AppInit] Socio gerente reactivado exitosamente');
                        } catch (updateError) {
                            console.error('[AppInit] Error al reactivar socio gerente:', updateError);
                            // Continuar para intentar asignar otro socio gerente
                            targetPartner = null;
                        }
                    }
                } else {
                    console.warn(`[AppInit] Socio gerente configurado (${managingPartnerId}) no encontrado. Se asignará uno nuevo.`);
                }
            }
            
            // 4. Si no hay socio gerente válido, asignar uno
            if (!targetPartner) {
                // Buscar socio p1 primero (por defecto)
                targetPartner = partners.find((p: any) => p.id === 'p1');
                
                if (!targetPartner) {
                    // Si no hay socio p1, tomar el primer socio activo
                    targetPartner = partners.find((p: any) => !!p.is_active);
                    
                    if (!targetPartner) {
                        console.log('[AppInit] No hay socios activos. Creando socio gerente por defecto...');
                        try {
                            // Crear socio gerente por defecto con ID 'p1'
                            await (partnerRepository as any).create({
                                id: 'p1',
                                name: 'Socio Gerente',
                                alias: 'Admin',
                                participationPercentage: 50,
                                role: 'Managing Partner',
                                 isManagingPartner: true
                            });
                            console.log('[AppInit] Socio gerente por defecto creado exitosamente (ID: p1)');
                            
                            // Guardar en configuración
                            await (configRepository as any).set('managing_partner_id', 'p1');
                            return true;
                            
                        } catch (createError) {
                            console.error('[AppInit] Error al crear socio gerente por defecto:', createError);
                            return false;
                        }
                    }
                }
                
                console.log(`[AppInit] Asignando socio gerente: ${targetPartner.name} (${targetPartner.id})`);
                
                // Asegurar que el socio esté activo
                if (!targetPartner.is_active) {
                    try {
                        await (partnerRepository as any).update(targetPartner.id, {
                            name: targetPartner.name,
                            alias: targetPartner.alias,
                            participationPercentage: targetPartner.participation_percentage,
                            role: targetPartner.role,
                            isManagingPartner: targetPartner.is_managing_partner,
                            isActive: true
                        });
                        console.log('[AppInit] Socio gerente reactivado');
                    } catch (updateError) {
                        console.error('[AppInit] Error al reactivar socio:', updateError);
                        return false;
                    }
                }
                
                // Establecer como socio gerente (is_managing_partner = true)
                if (!targetPartner.is_managing_partner) {
                    try {
                        await (partnerRepository as any).update(targetPartner.id, {
                            name: targetPartner.name,
                            alias: targetPartner.alias,
                            participationPercentage: targetPartner.participation_percentage,
                            role: targetPartner.role,
                            isManagingPartner: true,
                            isActive: targetPartner.is_active
                        });
                        console.log('[AppInit] Socio establecido como gerente');
                    } catch (updateError) {
                        console.error('[AppInit] Error al establecer socio como gerente:', updateError);
                        return false;
                    }
                }
                
                // Guardar en configuración
                await (configRepository as any).set('managing_partner_id', targetPartner.id);
                console.log(`[AppInit] managing_partner_id guardado: ${targetPartner.id}`);
            }
            
            // 5. Verificar que solo un socio tenga is_managing_partner = 1
            try {
                // Llamar a la función interna que garantiza unicidad
                await (partnerRepository as any)._ensureSingleManagingPartner(targetPartner.id);
            } catch (unicityError) {
                console.error('[AppInit] Error al garantizar unicidad del socio gerente:', unicityError);
                // No fallar la inicialización por esto
            }
            
            console.log('[AppInit] Socio gerente verificado correctamente');
            return true;
            
        } catch (error) {
            console.error('[AppInit] Error en verificación de socio gerente:', error);
            return false;
        }
    },
    
    /**
     * Verifica que existan datos básicos mínimos para operar
     */
    ensureBasicData: async (): Promise<boolean> => {
        try {
            console.log('[AppInit] Verificando datos básicos...');
            
            // Verificar unidades de negocio
            const businessUnits = await businessUnitRepository.getAll();
            console.log(`[AppInit] Unidades de negocio encontradas: ${businessUnits.length}`);
            
            if (businessUnits.length === 0) {
                console.warn('[AppInit] No hay unidades de negocio. La app puede no funcionar correctamente.');
            }
            
            // Verificar categorías
            const categories = await categoryRepository.getAll();
            console.log(`[AppInit] Categorías encontradas: ${categories.length}`);
            
            if (categories.length === 0) {
                console.warn('[AppInit] No hay categorías. La app puede no funcionar correctamente.');
            }
            
            return businessUnits.length > 0 && categories.length > 0;
            
        } catch (error) {
            console.error('[AppInit] Error verificando datos básicos:', error);
            return false;
        }
    },
    
    /**
     * Inicialización completa de la aplicación
     * Devuelve true si la app puede continuar, false si hay problemas críticos
     */
    initializeApp: async (): Promise<{
        success: boolean;
        hasManagingPartner: boolean;
        hasBasicData: boolean;
        message?: string;
    }> => {
        console.log('[AppInit] Iniciando verificación de aplicación...');
        
        try {
            // 1. Verificar nombre de unidad de negocio
            await appInitService.ensureBusinessUnitName();
            
            // 2. Verificar socio gerente
            const managingPartnerOk = await appInitService.ensureDefaultManagingPartner();
            
            // 3. Verificar datos básicos
            const basicDataOk = await appInitService.ensureBasicData();
            
            const success = managingPartnerOk && basicDataOk;
            
            return {
                success,
                hasManagingPartner: managingPartnerOk,
                hasBasicData: basicDataOk,
                message: success 
                    ? 'Aplicación inicializada correctamente'
                    : `Problemas en inicialización: ${!managingPartnerOk ? 'Falta socio gerente' : ''} ${!basicDataOk ? 'Faltan datos básicos' : ''}`
            };
            
        } catch (error) {
            console.error('[AppInit] Error crítico en inicialización:', error);
            return {
                success: false,
                hasManagingPartner: false,
                hasBasicData: false,
                message: `Error crítico: ${error instanceof Error ? error.message : 'Error desconocido'}`
            };
        }
    }
};