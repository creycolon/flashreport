import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments, useRouter } from 'expo-router';

import { DashboardScreen } from '../../src/features/dashboard/DashboardScreen';
import { MovementsListScreen } from '../../src/features/movements/MovementsListScreen';
import { AddMovementScreen } from '../../src/features/movements/AddMovementScreen';
import { ReportsScreen } from '../../src/features/reports/ReportsScreen';
import { SettingsScreen } from '../../src/features/settings/SettingsScreen';
import { WebLayoutEnhanced } from '../../src/ui/web/layouts/WebLayoutEnhanced';

const Tab = createMaterialTopTabNavigator();

const TAB_CONFIG = [
    { name: 'dashboard', label: 'Resumen', icon: 'stats-chart' as const },
    { name: 'list', label: 'Lista', icon: 'list' as const },
    { name: 'add', label: 'Agregar', icon: 'add-circle' as const },
    { name: 'reports', label: 'Reportes', icon: 'document-text' as const },
    { name: 'settings', label: 'Config', icon: 'settings' as const },
];

function BottomMenu() {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const router = useRouter();
    const segments = useSegments();
    
    const currentTab = segments[segments.length - 1] || 'dashboard';
    const tabIndex = TAB_CONFIG.findIndex(t => t.name === currentTab);
    const [activeIndex, setActiveIndex] = useState(tabIndex >= 0 ? tabIndex : 0);

    useEffect(() => {
        const newIndex = TAB_CONFIG.findIndex(t => t.name === currentTab);
        if (newIndex >= 0 && newIndex !== activeIndex) {
            setActiveIndex(newIndex);
        }
    }, [currentTab]);

    const handlePress = (index: number, tabName: string) => {
        setActiveIndex(index);
        router.navigate(`/(tabs)/${tabName}`);
    };

    const menuHeight = isLandscape ? 50 : 60;
    const totalHeight = menuHeight + insets.bottom;

    return (
        <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: totalHeight,
            backgroundColor: '#2d2d2d',
            borderTopWidth: 2,
            borderTopColor: '#38ff14',
            flexDirection: 'row',
            paddingBottom: insets.bottom,
        }}>
            {TAB_CONFIG.map((tab, index) => {
                const isFocused = activeIndex === index;
                return (
                    <TouchableOpacity
                        key={tab.name}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 4,
                        }}
                        onPress={() => handlePress(index, tab.name)}
                        activeOpacity={0.7}
                    >
                        <View style={{
                            backgroundColor: isFocused ? '#38ff14' : 'transparent',
                            borderRadius: 20,
                            padding: 6,
                        }}>
                            <Ionicons
                                name={tab.icon}
                                size={22}
                                color={isFocused ? '#000' : '#888888'}
                            />
                        </View>
                        <Text style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: isFocused ? '#38ff14' : '#888888',
                            marginTop: 2,
                        }}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function MobileTabs() {
    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                tabBarPosition="bottom"
                screenOptions={{
                    swipeEnabled: Platform.OS !== 'web',
                    tabBarShowLabel: false,
                    tabBarIndicatorStyle: { height: 0 },
                    tabBarStyle: { 
                        height: 0,
                        position: 'absolute',
                        zIndex: -1,
                    },
                }}
            >
                <Tab.Screen name="dashboard" component={DashboardScreen} />
                <Tab.Screen name="list" component={MovementsListScreen} />
                <Tab.Screen name="add" component={AddMovementScreen} />
                <Tab.Screen name="reports" component={ReportsScreen} />
                <Tab.Screen name="settings" component={SettingsScreen} />
            </Tab.Navigator>
            <BottomMenu />
        </View>
    );
}

export default function TabsLayout() {
    const { width } = useWindowDimensions();
    const segments = useSegments();
    
    // Detectar si está en navegador de PC (no móvil/tablet)
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    const userAgent = isBrowser ? navigator.userAgent : '';
    const isDesktopBrowser = /Mozilla|Opera|Chrome|Safari|Edge/i.test(userAgent) && !/Mobile|Tablet|Android/i.test(userAgent);
    const isWeb = Platform.OS === 'web';
    const isWebDesktop = isWeb && (isDesktopBrowser || width >= 768);

    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setBackgroundColorAsync('#2d2d2d');
            NavigationBar.setButtonStyleAsync('light');
        }
    }, []);

    if (isWebDesktop) {
        const activeScreen = segments[segments.length - 1] || 'dashboard';
        return <WebLayoutEnhanced activeRoute={activeScreen} />;
    }

    return <MobileTabs />;
}
