import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useSegments } from 'expo-router';
import { WebLayoutEnhanced } from '../../src/ui/web/layouts/WebLayoutEnhanced';
import { ProfileScreen } from '../profile';
import { authService } from '../../src/core/application/services/authService';
import { useState, useEffect } from 'react';

export default function ProfileRoute() {
    const { width } = useWindowDimensions();
    const segments = useSegments();
    
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    const userAgent = isBrowser ? navigator.userAgent : '';
    const isDesktopBrowser = /Mozilla|Opera|Chrome|Safari|Edge/i.test(userAgent) && !/Mobile|Tablet|Android/i.test(userAgent);
    const isWebDesktop = (Platform.OS === 'web') && (isDesktopBrowser || width >= 768);

    const [partner, setPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPartner();
    }, []);

    const loadPartner = async () => {
        try {
            const result = await authService.getCurrentPartner();
            if (result.partner) {
                setPartner(result.partner);
            }
        } catch (error) {
            console.error('Error loading partner:', error);
        } finally {
            setLoading(false);
        }
    };

    if (isWebDesktop) {
        return (
            <WebLayoutEnhanced activeRoute="profile" />
        );
    }

    return (
        <View style={styles.container}>
            <ProfileScreen 
                partner={partner}
                onUpdate={(updated: any) => setPartner(updated)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
