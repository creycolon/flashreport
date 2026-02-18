import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { appInitService } from '../../application/services/appInitService';

interface AppInitializerProps {
    children: React.ReactNode;
    onInitialized?: (result: {
        success: boolean;
        hasManagingPartner: boolean;
        hasBasicData: boolean;
        message?: string;
    }) => void;
    silent?: boolean;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({
    children,
    onInitialized,
    silent = false
}) => {
    const [initialized, setInitialized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                setLoading(true);
                
                const result = await appInitService.initializeApp();
                
                  console.log('[AppInitializer] Initialization result:', result);
                
                if (!result.success && !silent) {
                    // Mostrar advertencia solo si hay problemas críticos
                    Alert.alert(
                        'Atención - Configuración Incompleta',
                        result.message || 'La aplicación no tiene la configuración mínima requerida.',
                        [{ text: 'Continuar' }]
                    );
                }
                
                if (onInitialized) {
                    onInitialized(result);
                }
                
                setInitialized(true);
                
            } catch (error) {
                console.error('[AppInitializer] Error en inicialización:', error);
                
                if (!silent) {
                    Alert.alert(
                        'Error de Inicialización',
                        'No se pudo verificar la configuración inicial de la aplicación.',
                        [{ text: 'Continuar' }]
                    );
                }
                
                setInitialized(true); // Permitir continuar aunque haya error
                
            } finally {
                setLoading(false);
            }
        };

        initializeApp();
    }, [onInitialized, silent]);

    // Mostrar children mientras se inicializa
    // En una implementación real, podríamos mostrar un splash screen aquí
    if (loading) {
         // Loading state - showing children with background
        return (
            <View style={styles.container}>
                {/* Podríamos mostrar un indicador de carga aquí si fuera necesario */}
                {children}
            </View>
        );
    }

    return <>{children}</>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});