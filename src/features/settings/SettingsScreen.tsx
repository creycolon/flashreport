import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Alert, Platform, Switch, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@ui/shared/theme';
import { Typography, Card, Button, ManagePartnerModal } from '@ui/shared/components';
import { testDataService } from '@core/application/services/testDataService';
import { managingPartnerService } from '@core/application/services/managingPartnerService';
import { configRepository } from '@core/infrastructure/repositories/configRepository';
import { categoryRepository } from '@core/infrastructure/repositories/categoryRepository';
import { businessUnitRepository } from '@core/infrastructure/repositories/businessUnitRepository';
import { partnerRepository } from '@core/infrastructure/repositories/partnerRepository';
import { supabase } from '@core/infrastructure/db/supabaseClient';
import { authService } from '@core/application/services/authService';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { SettingsEnhanced } from '@ui/web/components';
import { pluralizeSpanish } from '@core/utils/stringUtils';

export const SettingsScreen = () => {
    const router = useRouter();
    const { width: windowWidth } = useWindowDimensions();
    const isWebDesktop = Platform.OS === 'web' && windowWidth >= 1024;
    const [generating, setGenerating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [dynamicZoom, setDynamicZoom] = useState(true);
    const [managingPartner, setManagingPartner] = useState<any>(null);
    const [showManagePartnerModal, setShowManagePartnerModal] = useState(false);
    const [businessLabel, setBusinessLabel] = useState('Local');
    const { colors, themePreference, setThemePreference } = useTheme();

    useEffect(() => {
        console.warn('[SettingsScreen] themePreference changed:', themePreference);
    }, [themePreference]);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        loadManagingPartner();
    }, []);

    const loadManagingPartner = async () => {
        try {
            const partner = await managingPartnerService.getCurrentManagingPartner();
            setManagingPartner(partner);
        } catch (error) {
            console.error('Error loading managing partner:', error);
        }
    };

    const handleManagingPartnerSuccess = (newPartnerId: string, newPartnerName: string) => {
        // Recargar la información del socio gerente
        loadManagingPartner();
        Alert.alert('Éxito', `Socio gerente cambiado a ${newPartnerName}`);
    };

    const loadSettings = async () => {
        const zoomVal = await (configRepository as any).get('chart_dynamic_zoom', 'true');
        setDynamicZoom(zoomVal === 'true');

        const labelVal = await (configRepository as any).get('default_business', 'Local');
        setBusinessLabel(labelVal);
    };

    const diagnoseDatabase = async (): Promise<string> => {
        try {
            console.log('[Diagnóstico] Starting Supabase database diagnosis...');
            let diagnosisLines = [];

            try {
                const [units, categories, allCategories] = await Promise.all([
                    businessUnitRepository.getAll(),
                    categoryRepository.getByType('CR'),
                    categoryRepository.getAll()
                ]);
                diagnosisLines.push(`✅ Unidades: ${units.length}`);
                diagnosisLines.push(`✅ Categorías CR: ${categories.length}`);
                diagnosisLines.push(`✅ Total categorías: ${allCategories.length}`);
                diagnosisLines.push(`📋 Categorías CR: ${categories.map((c: any) => c.code).join(', ')}`);

                // Count total movements using Supabase
                try {
                    console.log('[Diagnóstico] Counting movements...');
                    const { count, error } = await supabase
                        .from('cash_movements')
                        .select('*', { count: 'exact', head: true })
                        .eq('is_active', true);

                    if (error) {
                        throw error;
                    }

                    console.log('[Diagnóstico] Count result:', count);
                    const totalMovements = count || 0;
                    diagnosisLines.push(`📊 Movimientos activos: ${totalMovements}`);
                } catch (countErr) {
                    console.error('[Diagnóstico] Count error:', countErr);
                    diagnosisLines.push(`❌ Error contando movimientos: ${(countErr as Error).message}`);
                }

                // Try a simple test query
                try {
                    const { data, error } = await supabase
                        .from('business_units')
                        .select('id')
                        .limit(1);

                    if (error) throw error;
                    diagnosisLines.push(`🔌 Test query: ${data ? 'OK' : 'FAIL'}`);
                } catch (testErr) {
                    diagnosisLines.push(`❌ Test query failed: ${(testErr as Error).message}`);
                }

                // Check if we can insert a test record (only if we have units and categories)
                if (units.length > 0 && categories.length > 0) {
                    try {
                        const testMovement = {
                            businessUnitId: units[0].id,
                            type: 'CR' as const,
                            categoryId: categories[0].id,
                            amount: 1000,
                            description: 'Test diagnóstico',
                            date: new Date().toISOString(),
                            createdBy: 'p1'
                        };



                        // We'll just prepare the statement but not execute it
                        diagnosisLines.push(`🧪 Prueba de inserción: Configurada (BU: ${units[0].name}, Cat: ${categories[0].code})`);
                    } catch (insertErr) {
                        diagnosisLines.push(`❌ Error preparando inserción: ${(insertErr as Error).message}`);
                    }
                } else {
                    diagnosisLines.push(`⚠️  No hay unidades o categorías para prueba de inserción`);
                }

            } catch (repoErr) {
                diagnosisLines.push(`❌ Error en repositorios: ${(repoErr as Error).message}`);
            }

            return diagnosisLines.join('\n');
        } catch (err) {
            console.error('[Diagnóstico] Error general:', err);
            return `❌ Error en diagnóstico: ${(err as Error).message}`;
        }
    };

    const handleToggleZoom = async (value: boolean) => {
        setDynamicZoom(value);
        await (configRepository as any).set('chart_dynamic_zoom', value ? 'true' : 'false');
    };

    const handleGenerateData = async () => {
        if (Platform.OS !== 'web') {
            Alert.alert('Iniciando', 'Generando datos de simulación... esto puede tardar unos segundos.');
        }
        setGenerating(true);
        try {
            console.log('[GenerateData] Starting data generation...');
            const success = await testDataService.generateMockData();
            console.log('[GenerateData] Generation result:', success);

            if (success) {
                if (Platform.OS === 'web') {
                    window.alert('Éxito: Datos generados');
                } else {
                    Alert.alert('Éxito', 'Se han generado los datos.');
                }
            } else {
                const diagnosis = await diagnoseDatabase();
                console.log('[GenerateData] Generation failed. Diagnosis:', diagnosis);
                Alert.alert('No se generaron datos', `La generación de datos no pudo completarse. Posibles causas:\n\n${diagnosis}`);
            }
        } catch (error) {
            console.error('[GenerateData] Error:', error);
            const diagnosis = await diagnoseDatabase();
            console.log('[Diagnóstico]', diagnosis);
            Alert.alert('Error', `No se pudieron generar los datos. Verifica que la base de datos esté inicializada correctamente.\n\n${diagnosis}`);
        } finally {
            setGenerating(false);
        }
    };

    const handleClearData = async () => {
        const proceed = Platform.OS === 'web'
            ? window.confirm('¿Borrar todos los movimientos? Los locales y socios se mantendrán.')
            : true;

        if (!proceed && Platform.OS === 'web') return;

        setDeleting(true);
        try {
            await testDataService.clearAllData();
            if (Platform.OS === 'web') {
                window.alert('Historial de movimientos borrado');
            } else {
                Alert.alert('Borrado', 'Toda la información ha sido eliminada.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudieron borrar los datos.');
        } finally {
            setDeleting(false);
        }
    };

    const handleLogout = async () => {
        const proceed = Platform.OS === 'web'
            ? window.confirm('¿Cerrar sesión?')
            : await new Promise(resolve => {
                Alert.alert(
                    'Cerrar Sesión',
                    '¿Estás seguro de que quieres cerrar sesión?',
                    [
                        { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
                        { text: 'Cerrar Sesión', onPress: () => resolve(true), style: 'destructive' }
                    ]
                );
            });

        if (proceed) {
            await authService.signOut();
            router.replace('/login');
        }
    };

    const handleFactoryReset = async () => {
        const proceed = Platform.OS === 'web'
            ? window.confirm('¡BORRADO TOTAL! Se restablecerán los locales y socios de fábrica y se borrará todo el historial. ¿Estás muy seguro?')
            : await new Promise(resolve => {
                Alert.alert(
                    '¡BORRADO TOTAL!',
                    'Se restablecerán los locales y socios de fábrica y se borrará todo el historial. ¿Estás muy seguro?',
                    [
                        { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
                        { text: 'SÍ, BORRAR TODO', onPress: () => resolve(true), style: 'destructive' }
                    ]
                );
            });

        if (proceed) {
            setDeleting(true);
            try {
                await testDataService.factoryReset();
                if (Platform.OS === 'web') {
                    window.location.reload();
                } else {
                    Alert.alert('Éxito', 'El sistema ha sido restablecido de fábrica.');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'No se pudo realizar el reinicio de fábrica.');
            } finally {
                setDeleting(false);
            }
        }
    };

    const handleDeleteOptions = () => {
        Alert.alert(
            'Opciones de Borrado',
            'Selecciona una acción',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Borrar Movimientos', onPress: handleClearData, style: 'destructive' },
                { text: 'Reinicio Total', onPress: handleFactoryReset, style: 'destructive' },
            ],
            { cancelable: true }
        );
    };

    const styles = useMemo(() => StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        container: { flex: 1 },
        content: { padding: theme.spacing.md },
        header: { marginBottom: theme.spacing.xl },
        section: { marginBottom: 30 },
        sectionLabel: { marginBottom: theme.spacing.md, marginLeft: 4 },
        toolCard: { marginBottom: theme.spacing.md, padding: theme.spacing.lg },
        settingRow: { flexDirection: 'row', alignItems: 'center' },
        themeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
        activeThemeChip: { backgroundColor: colors.primary, borderColor: colors.primary },
        themeButtons: { flexDirection: 'row', gap: theme.spacing.sm },
        themeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
        toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
        settingHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
        footer: { marginTop: 40, paddingBottom: 20 }
    }), [colors]);

    if (isWebDesktop) {
        return (
            <>
                <SettingsEnhanced
                    onManageBusinessUnits={() => router.push('/business-units')}
                    onManagePartners={() => router.push('/partners')}
                    onChangeManagingPartner={() => setShowManagePartnerModal(true)}
                    onGenerateMockData={handleGenerateData}
                    onClearData={handleClearData}
                    onFactoryReset={handleFactoryReset}
                    onToggleDynamicZoom={handleToggleZoom}
                    onChangeTheme={setThemePreference}
                    dynamicZoom={dynamicZoom}
                    themePreference={themePreference}
                    managingPartner={managingPartner}
                    generatingData={generating}
                    deletingData={deleting}
                    businessLabel={businessLabel}
                />
                <ManagePartnerModal
                    visible={showManagePartnerModal}
                    onClose={() => setShowManagePartnerModal(false)}
                    onSuccess={handleManagingPartnerSuccess}
                />
            </>
        );
    }

    return (
        <View style={styles.safe}>
            <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
                <View style={styles.header}>
                    <Typography variant="h1">Configuración</Typography>
                    <Typography variant="body" color={colors.textSecondary}>
                        Gestión del sistema y herramientas de desarrollo
                    </Typography>
                </View>

                <View style={styles.section}>
                    <Typography variant="label" style={styles.sectionLabel}>Gestión de Catálogos</Typography>
                    <Card style={styles.toolCard}>
                        <Typography variant="h3" style={{ marginBottom: 4 }}>{businessLabel || 'Unidades de Negocio'}</Typography>
                        <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: 16 }}>
                            Configura los {businessLabel?.toLowerCase() || 'locales'}, colores y orden de visualización en el dashboard.
                        </Typography>
                        <Button
                            title={`Gestionar ${businessLabel || 'Locales'}`}
                            variant="outline"
                            onPress={() => router.push('/business-units')}
                        />
                    </Card>

                    <Card style={styles.toolCard}>
                        <Typography variant="h3" style={{ marginBottom: 4 }}>Socios</Typography>
                        <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: 16 }}>
                            Administra los socios de tu negocio y sus porcentajes de participación.
                        </Typography>
                        <Button
                            title="Gestionar Socios"
                            variant="outline"
                            onPress={() => router.push('/partners')}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Typography variant="label" style={styles.sectionLabel}>Gestión del Sistema</Typography>

                    <Card style={styles.toolCard}>
                        <Typography variant="h3" style={{ marginBottom: 4 }}>Socio Gerente</Typography>
                        <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: 12 }}>
                            {managingPartner ? `${managingPartner.name} (${managingPartner.alias})` : 'No asignado'}
                        </Typography>
                        <Button
                            title="Cambiar Socio Gerente"
                            variant="outline"
                            onPress={() => setShowManagePartnerModal(true)}
                        />
                    </Card>

                    <Card style={styles.toolCard}>
                        <View style={styles.settingRow}>
                            <View style={{ flex: 1 }}>
                                <Typography variant="h3" style={{ marginBottom: 4 }}>Zoom Dinámico</Typography>
                                <Typography variant="body" color={colors.textSecondary}>
                                    Ajuste automático de gráficos
                                </Typography>
                            </View>
                            <Switch
                                value={dynamicZoom}
                                onValueChange={handleToggleZoom}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor="#fff"
                            />
                        </View>
                    </Card>

                    <Card style={styles.toolCard}>
                        <Typography variant="h3" style={{ marginBottom: 4 }}>Tema</Typography>
                        <View style={styles.themeButtons}>
                            {['auto', 'light', 'dark'].map((theme) => (
                                <TouchableOpacity
                                    key={theme}
                                    style={[
                                        styles.themeButton,
                                        themePreference === theme && styles.activeThemeChip
                                    ]}
                                    onPress={() => setThemePreference(theme as any)}
                                >
                                    <Typography
                                        color={themePreference === theme ? '#fff' : colors.text}
                                        weight={themePreference === theme ? 'bold' : 'regular'}
                                    >
                                        {theme === 'auto' ? 'Auto' : theme === 'light' ? 'Claro' : 'Oscuro'}
                                    </Typography>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Typography variant="body" color={colors.textSecondary} style={{ marginTop: 12 }}>
                            {themePreference === 'auto'
                                ? 'Usa la configuración de tu dispositivo'
                                : themePreference === 'dark'
                                    ? 'Tema oscuro siempre activo'
                                    : 'Tema claro siempre activo'}
                        </Typography>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Typography variant="label" style={styles.sectionLabel}>Herramientas de Datos</Typography>
                    <View style={styles.toolsGrid}>
                        <Card style={styles.toolCard}>
                            <Typography variant="h3" style={{ marginBottom: 4 }}>Generar Datos</Typography>
                            <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: 16 }}>
                                Crea movimientos aleatorios de los últimos 30 días para pruebas y demostraciones.
                            </Typography>
                            <Button
                                title={generating ? 'Generando...' : 'Generar Datos de Prueba'}
                                onPress={handleGenerateData}
                                loading={generating}
                                style={{ alignSelf: 'flex-start' }}
                            />
                        </Card>

                        <Card style={[styles.toolCard, { borderColor: colors.danger }]}>
                            <View style={styles.settingHeader}>
                                <Ionicons name="trash" size={24} color={colors.danger} />
                                <Typography variant="caption" color={colors.danger}>
                                    Peligro
                                </Typography>
                            </View>
                            <Typography variant="h3" style={{ marginBottom: 4 }}>Limpiar Datos</Typography>
                            <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: 16 }}>
                                Elimina todos los movimientos de efectivo. Esta acción no se puede deshacer.
                            </Typography>
                            <Button
                                title={deleting ? 'Eliminando...' : 'Limpiar Datos'}
                                onPress={handleClearData}
                                loading={deleting}
                                style={{ alignSelf: 'flex-start', backgroundColor: colors.danger }}
                            />
                        </Card>
                    </View>
                </View>

                <View style={styles.section}>
                    <Button
                        title="Cerrar Sesión"
                        variant="outline"
                        onPress={handleLogout}
                        style={{ borderColor: colors.danger }}
                        textStyle={{ color: colors.danger }}
                    />
                </View>

                <View style={styles.footer}>
                    <Typography variant="caption" align="center">Flash Report v1.0.0</Typography>
                    <Typography variant="caption" align="center" color={colors.textMuted}>Hecho para gestión estratégica</Typography>
                </View>
            </ScrollView>
        </View>
    );
};


