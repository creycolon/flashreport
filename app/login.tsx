import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Card, Input, Button } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { authService } from '@core/application/services/authService';

export const LoginScreen = () => {
    const router = useRouter();
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Por favor ingresa email y contraseña');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('[Login] Attempting login with:', email);
            const result = await authService.signIn(email, password);
            console.log('[Login] Result:', result);
            
            if (result.error) {
                console.log('[Login] Error:', result.error);
                setError(result.error);
            } else {
                console.log('[Login] Success, user:', result.user?.email, 'partner:', result.partner);
                router.replace('/(tabs)');
            }
        } catch (err: any) {
            console.log('[Login] Catch error:', err);
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.logoContainer}>
                    <Ionicons name="cash" size={80} color={colors.primary} />
                    <Typography variant="h1" align="center" style={{ marginTop: theme.spacing.md }}>
                        Flash Report
                    </Typography>
                    <Typography variant="body" color={colors.textSecondary} align="center" style={{ marginTop: theme.spacing.sm }}>
                        Ingresa tus credenciales
                    </Typography>
                </View>

                <Card style={styles.card}>
                    <View style={styles.inputContainer}>
                        <Input
                            label="Email"
                            placeholder="tu@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Contraseña"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons 
                                        name={showPassword ? 'eye-off' : 'eye'} 
                                        size={24} 
                                        color={colors.textSecondary} 
                                    />
                                </TouchableOpacity>
                            }
                        />
                    </View>

                    {error ? (
                        <Typography color={colors.danger} style={{ marginBottom: theme.spacing.md }}>
                            {error}
                        </Typography>
                    ) : null}

                    <Button
                        title="Iniciar Sesión"
                        onPress={handleLogin}
                        loading={loading}
                        style={{ marginTop: theme.spacing.md }}
                    />

                    <TouchableOpacity 
                        style={{ marginTop: theme.spacing.lg, alignItems: 'center' }}
                        onPress={() => router.push('/forgot-password')}
                    >
                        <Typography variant="body" color={colors.primary}>
                            ¿Olvidaste tu contraseña?
                        </Typography>
                    </TouchableOpacity>
                </Card>

                <Typography variant="caption" color={colors.textMuted} align="center" style={{ marginTop: theme.spacing.xl }}>
                    © 2025 Flash Report
                </Typography>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    card: {
        padding: theme.spacing.lg,
    },
    inputContainer: {
        marginBottom: theme.spacing.md,
    },
});

export default LoginScreen;
