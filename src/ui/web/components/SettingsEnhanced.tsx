import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Card, Button } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';

export interface SettingsEnhancedProps {
    onManageBusinessUnits?: () => void;
    onManagePartners?: () => void;
    onChangeManagingPartner?: () => void;
    onMyProfile?: () => void;
    onGenerateMockData?: () => void;
    onClearData?: () => void;
    onFactoryReset?: () => void;
    onToggleDynamicZoom?: (enabled: boolean) => void;
    onChangeTheme?: (themePreference: 'auto' | 'dark' | 'light') => void;
    dynamicZoom?: boolean;
    themePreference?: 'auto' | 'dark' | 'light';
    managingPartner?: { name: string; role: string } | null;
    generatingData?: boolean;
    deletingData?: boolean;
    businessLabel?: string;
}

export const SettingsEnhanced: React.FC<SettingsEnhancedProps> = ({
    onManageBusinessUnits,
    onManagePartners,
    onChangeManagingPartner,
    onMyProfile,
    onGenerateMockData,
    onClearData,
    onFactoryReset,
    onToggleDynamicZoom,
    onChangeTheme,
    dynamicZoom = true,
    themePreference = 'auto',
    managingPartner = null,
    generatingData = false,
    deletingData = false,
    businessLabel = 'Negocio',
}) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: theme.spacing.lg,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xl,
        },
        title: {
            color: colors.text,
            fontSize: theme.typography.sizes.xxl,
            fontWeight: 'bold',
        },
        subtitle: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.sm,
            marginTop: theme.spacing.xs,
        },
        actions: {
            flexDirection: 'row',
            gap: theme.spacing.md,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.spacing.borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
        },
        actionButtonPrimary: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        section: {
            marginBottom: theme.spacing.xl,
        },
        sectionTitle: {
            color: colors.text,
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
            marginBottom: theme.spacing.md,
        },
        settingsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.md,
        },
        settingCard: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.xl,
            padding: theme.spacing.lg,
            flex: 1,
            minWidth: 300,
        },
        settingHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        settingTitle: {
            color: colors.text,
            fontSize: theme.typography.sizes.md,
            fontWeight: 'bold',
            marginBottom: theme.spacing.xs,
        },
        settingDescription: {
            color: colors.textSecondary,
            fontSize: theme.typography.sizes.sm,
            marginBottom: theme.spacing.md,
        },
        settingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.md,
        },
        settingLabel: {
            flex: 1,
        },
        themeChip: {
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.spacing.borderRadius.full,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            flex: 1,
            alignItems: 'center',
        },
        activeThemeChip: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        themeChipText: {
            color: colors.text,
            fontWeight: 'bold',
        },
        activeThemeChipText: {
            color: colors.cardBackground,
        },
        themeChipsRow: {
            flexDirection: 'row',
            gap: theme.spacing.md,
            marginTop: theme.spacing.sm,
        },
        dangerCard: {
            backgroundColor: colors.danger + '10',
            borderColor: colors.danger + '30',
        },
        dangerText: {
            color: colors.danger,
        },
        footer: {
            marginTop: theme.spacing.xl,
            paddingTop: theme.spacing.xl,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            alignItems: 'center',
        },
    });

    const handleDeleteOption = () => {
        // Show delete options modal
        if (Platform.OS === 'web') {
            const choice = window.confirm('Selecciona acción:\n\n1. Borrar Movimientos\n2. Reinicio Total\n\nCancelar para salir.');
            if (choice) {
                // In a real app, we would show a proper modal
                console.log('Delete option requested');
            }
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Typography style={styles.title}>
                        Configuración y Parámetros
                    </Typography>
                    <Typography style={styles.subtitle}>
                        Gestión del sistema, catálogos y herramientas de desarrollo
                    </Typography>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                        onPress={onGenerateMockData}
                        disabled={generatingData}
                    >
                        <Ionicons name="rocket" size={20} color={colors.cardBackground} />
                        <Typography color={colors.cardBackground} weight="bold">
                            {generatingData ? 'Generando...' : 'Generar Datos'}
                        </Typography>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Catalog Management Section */}
            <View style={styles.section}>
                <Typography style={styles.sectionTitle}>
                    Gestión de Catálogos
                </Typography>
                <View style={styles.settingsGrid}>
                    {/* Business Units */}
                    <Card style={styles.settingCard}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="business" size={24} color={colors.primary} />
                            <Typography variant="caption" color={colors.textMuted}>
                                {businessLabel}
                            </Typography>
                        </View>
                        <Typography style={styles.settingTitle}>
                            Catálogo de {businessLabel}s
                        </Typography>
                        <Typography style={styles.settingDescription}>
                            Configura los {businessLabel.toLowerCase()}s, colores y orden de visualización en el dashboard.
                        </Typography>
                        <Button
                            title={`Gestionar ${businessLabel}s`}
                            variant="outline"
                            onPress={onManageBusinessUnits ? onManageBusinessUnits : () => { }}
                            style={{ alignSelf: 'flex-start' }}
                        />
                    </Card>

                    {/* Partners */}
                    <Card style={styles.settingCard}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="people" size={24} color={colors.primary} />
                            <Typography variant="caption" color={colors.textMuted}>
                                Socios
                            </Typography>
                        </View>
                        <Typography style={styles.settingTitle}>
                            Socios y Participación
                        </Typography>
                        <Typography style={styles.settingDescription}>
                            Administra la lista de socios y sus porcentajes de participación.
                        </Typography>
                        <Button
                            title="Gestionar Socios"
                            variant="outline"
                            onPress={onManagePartners ? onManagePartners : () => { }}
                            style={{ alignSelf: 'flex-start' }}
                        />
                    </Card>

                    {/* My Profile */}
                    <Card style={styles.settingCard}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="person-circle" size={24} color={colors.primary} />
                            <Typography variant="caption" color={colors.textMuted}>
                                Usuario
                            </Typography>
                        </View>
                        <Typography style={styles.settingTitle}>
                            Mi Perfil
                        </Typography>
                        <Typography style={styles.settingDescription}>
                            Edita tu información personal, foto de perfil y cambia tu contraseña.
                        </Typography>
                        <Button
                            title="Editar Perfil"
                            variant="outline"
                            onPress={onMyProfile ? onMyProfile : () => { }}
                            style={{ alignSelf: 'flex-start' }}
                        />
                    </Card>

                    {/* Managing Partner */}
                    <Card style={styles.settingCard}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="person" size={24} color={colors.primary} />
                            <Typography variant="caption" color={colors.textMuted}>
                                Socio Gerente
                            </Typography>
                        </View>
                        <Typography style={styles.settingTitle}>
                            Socio Administrador
                        </Typography>
                        <Typography style={styles.settingDescription}>
                            {managingPartner
                                ? `${managingPartner.name} (${managingPartner.role})`
                                : 'No hay socio gerente asignado'
                            }
                        </Typography>
                        <Button
                            title="Cambiar Socio Gerente"
                            variant="outline"
                            onPress={onChangeManagingPartner ? onChangeManagingPartner : () => { }}
                            style={{ alignSelf: 'flex-start' }}
                        />
                    </Card>
                </View>
            </View>

            {/* Data Tools Section */}
            <View style={styles.section}>
                <Typography style={styles.sectionTitle}>
                    Herramientas de Datos
                </Typography>
                <View style={styles.settingsGrid}>
                    {/* Generate Mock Data */}
                    <Card style={styles.settingCard}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="analytics" size={24} color={colors.primary} />
                            <Typography variant="caption" color={colors.textMuted}>
                                Simulación
                            </Typography>
                        </View>
                        <Typography style={styles.settingTitle}>
                            Generar Simulacro
                        </Typography>
                        <Typography style={styles.settingDescription}>
                            Crea movimientos aleatorios de los últimos 30 días para pruebas y demostraciones.
                        </Typography>
                        <Button
                            title={generatingData ? 'Generando...' : 'Generar Datos de Prueba'}
                            onPress={onGenerateMockData ? onGenerateMockData : () => { }}
                            loading={generatingData}
                            style={{ alignSelf: 'flex-start' }}
                        />
                    </Card>

                    {/* Delete Data */}
                    <Card style={[styles.settingCard, styles.dangerCard]}>
                        <View style={styles.settingHeader}>
                            <Ionicons name="trash" size={24} color={colors.danger} />
                            <Typography variant="caption" color={colors.danger}>
                                Peligro
                            </Typography>
                        </View>
                        <Typography style={[styles.settingTitle, styles.dangerText]}>
                            Borrar Datos
                        </Typography>
                        <Typography style={[styles.settingDescription, styles.dangerText]}>
                            Borra movimientos de prueba o realiza un reinicio total del sistema.
                        </Typography>
                        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                            <Button
                                title="Borrar Movimientos"
                                variant="outline"
                                onPress={onClearData ? onClearData : () => { }}
                                loading={deletingData}
                                style={{ flex: 1 }}
                            />
                            <Button
                                title="Reinicio Total"
                                variant="outline"
                                onPress={onFactoryReset ? onFactoryReset : () => { }}
                                loading={deletingData}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </Card>
                </View>
            </View>

            {/* Visual Preferences */}
            <View style={styles.section}>
                <Typography style={styles.sectionTitle}>
                    Preferencias Visuales
                </Typography>
                <Card style={styles.settingCard}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLabel}>
                            <Typography weight="bold">Lupa en Gráficos</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                Ajusta el eje Y para ver mejor las variaciones (Zoom dinámico).
                            </Typography>
                        </View>
                        <Switch
                            value={dynamicZoom}
                            onValueChange={onToggleDynamicZoom}
                            trackColor={{ false: colors.border, true: colors.primary + '80' }}
                            thumbColor={dynamicZoom ? colors.primary : '#f4f3f4'}
                        />
                    </View>
                </Card>
            </View>

            {/* Theme Selection */}
            <View style={styles.section}>
                <Typography style={styles.sectionTitle}>
                    Tema de la Aplicación
                </Typography>
                <Card style={styles.settingCard}>
                    <Typography style={styles.settingDescription}>
                        Selecciona el modo de visualización preferido para la interfaz.
                    </Typography>
                    <View style={styles.themeChipsRow}>
                        {(['auto', 'dark', 'light'] as const).map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                style={[
                                    styles.themeChip,
                                    themePreference === mode && styles.activeThemeChip
                                ]}
                                onPress={() => onChangeTheme?.(mode)}
                            >
                                <Typography
                                    weight="bold"
                                    style={[
                                        styles.themeChipText,
                                        themePreference === mode && styles.activeThemeChipText
                                    ]}
                                >
                                    {mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Oscuro' : 'Claro'}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: theme.spacing.md }}>
                        {themePreference === 'auto'
                            ? 'Usa la configuración de tu dispositivo'
                            : themePreference === 'dark'
                                ? 'Tema oscuro siempre activo'
                                : 'Tema claro siempre activo'
                        }
                    </Typography>
                </Card>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Typography variant="caption" color={colors.textMuted}>
                    Flash Report v1.0.0
                </Typography>
                <Typography variant="caption" color={colors.textMuted}>
                    Hecho para gestión estratégica
                </Typography>
            </View>
        </ScrollView>
    );
};

// Example usage component
export const SettingsEnhancedExample: React.FC = () => {
    return (
        <SettingsEnhanced
            onManageBusinessUnits={() => console.log('Manage business units')}
            onManagePartners={() => console.log('Manage partners')}
            onChangeManagingPartner={() => console.log('Change managing partner')}
            onGenerateMockData={() => console.log('Generate mock data')}
            onClearData={() => console.log('Clear data')}
            onFactoryReset={() => console.log('Factory reset')}
            onToggleDynamicZoom={(enabled) => console.log('Toggle dynamic zoom', enabled)}
            onChangeTheme={(theme) => console.log('Change theme', theme)}
            dynamicZoom={true}
            themePreference="auto"
            managingPartner={{ name: 'CRISTIAN', role: 'ADMIN' }}
        />
    );
};