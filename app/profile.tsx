import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Typography, Card, Input, Button } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { authService } from '@core/application/services/authService';

interface ProfileScreenProps {
    partner?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        address?: string;
        image?: string;
        is_manager: boolean;
    };
    onUpdate?: (updatedPartner: any) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ partner, onUpdate }) => {
    const router = useRouter();
    const { colors } = useTheme();
    
    const [name, setName] = useState(partner?.name || '');
    const [email, setEmail] = useState(partner?.email || '');
    const [phone, setPhone] = useState(partner?.phone || '');
    const [address, setAddress] = useState(partner?.address || '');
    const [image, setImage] = useState(partner?.image || '');
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (partner) {
            setName(partner.name || '');
            setEmail(partner.email || '');
            setPhone(partner.phone || '');
            setAddress(partner.address || '');
            setImage(partner.image || '');
        }
    }, [partner]);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (!permissionResult.granted) {
            Alert.alert('Permiso requerido', 'Necesitas permitir acceso a la galería de fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setUploadingImage(true);
            try {
                if (partner?.id) {
                    const uploadResult = await authService.uploadAvatar(partner.id, result.assets[0].uri);
                    if (uploadResult.url) {
                        setImage(uploadResult.url);
                        Alert.alert('Éxito', 'Foto de perfil actualizada');
                    } else if (uploadResult.error) {
                        Alert.alert('Error', uploadResult.error);
                    }
                }
            } catch (error) {
                Alert.alert('Error', 'No se pudo subir la imagen');
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const handleSave = async () => {
        if (!partner?.id) return;
        
        setLoading(true);
        try {
            const result = await authService.updatePartner(partner.id, {
                name,
                phone,
                address
            });

            if (result.success) {
                Alert.alert('Éxito', 'Perfil actualizado correctamente');
                onUpdate?.({
                    ...partner,
                    name,
                    phone,
                    address,
                    image
                });
            } else {
                Alert.alert('Error', result.error || 'No se pudo actualizar');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Cerrar Sesión', 
                    style: 'destructive',
                    onPress: async () => {
                        await authService.signOut();
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Typography variant="h1" style={styles.title}>Mi Perfil</Typography>

                {/* Avatar Section */}
                <Card style={styles.avatarCard}>
                    <View style={styles.avatarContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                                <Typography variant="h1" style={{ color: '#fff' }}>
                                    {name ? name.charAt(0).toUpperCase() : 'U'}
                                </Typography>
                            </View>
                        )}
                        <TouchableOpacity 
                            style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}
                            onPress={pickImage}
                            disabled={uploadingImage}
                        >
                            <Ionicons name="camera" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Typography variant="h3" align="center" style={styles.name}>
                        {name || 'Usuario'}
                    </Typography>
                    <Typography variant="body" color={colors.textSecondary} align="center">
                        {partner?.is_manager ? 'Gerente' : 'Socio'}
                    </Typography>
                </Card>

                {/* Form Section */}
                <Card style={styles.formCard}>
                    <Typography variant="h3" style={styles.sectionTitle}>Información Personal</Typography>
                    
                    <View style={styles.inputContainer}>
                        <Input
                            label="Nombre"
                            value={name}
                            onChangeText={setName}
                            placeholder="Tu nombre"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="tu@email.com"
                            editable={false}
                        />
                        <Typography variant="caption" color={colors.textMuted}>
                            El email no se puede cambiar
                        </Typography>
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Teléfono"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Número de teléfono"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Dirección"
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Tu dirección"
                            multiline
                        />
                    </View>

                    <Button
                        title="Guardar Cambios"
                        onPress={handleSave}
                        loading={loading}
                        style={{ marginTop: theme.spacing.md }}
                    />
                </Card>

                {/* Logout Section */}
                <Card style={styles.logoutCard}>
                    <Button
                        title="Cerrar Sesión"
                        variant="outline"
                        onPress={handleLogout}
                        style={{ borderColor: colors.danger }}
                        textStyle={{ color: colors.danger }}
                    />
                </Card>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: theme.spacing.lg,
        maxWidth: 600,
        marginHorizontal: 'auto',
    },
    title: {
        marginBottom: theme.spacing.lg,
    },
    avatarCard: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        marginBottom: theme.spacing.lg,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: theme.spacing.md,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        marginTop: theme.spacing.sm,
    },
    formCard: {
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        marginBottom: theme.spacing.lg,
    },
    inputContainer: {
        marginBottom: theme.spacing.md,
    },
    logoutCard: {
        padding: theme.spacing.lg,
    },
});

export default ProfileScreen;
