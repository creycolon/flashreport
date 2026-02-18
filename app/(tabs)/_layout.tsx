import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import Index from './index';
import List from './list';
import Add from './add';
import Reports from './reports';
import Settings from './settings';
import { useTheme } from '../../src/ui/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebLayout } from '../../src/ui/layouts';
import { useSegments } from 'expo-router';

const Tab = createMaterialTopTabNavigator();

const TAB_CONFIG: Array<{ name: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
    { name: 'index', label: 'Resumen', icon: 'stats-chart' },
    { name: 'list', label: 'Historial', icon: 'list' },
    { name: 'add', label: 'Agregar', icon: 'add-circle' },
    { name: 'reports', label: 'Reportes', icon: 'document-text' },
    { name: 'settings', label: 'Ajustes', icon: 'settings-outline' },
];

function CustomTabBar({ state, navigation }: { state: any; navigation: any }) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const styles = StyleSheet.create({
        tabBar: {
            flexDirection: 'row',
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 8),
            height: 60 + insets.bottom,
        },
        tabItem: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        tabLabel: {
            fontSize: 11,
            marginTop: 4,
        },
    });

    return (
        <View style={styles.tabBar}>
            {TAB_CONFIG.map((tab, index) => {
                const isFocused = state.index === index;
                const color = isFocused ? colors.primary : colors.textMuted;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: tab.name,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(tab.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={tab.name}
                        style={styles.tabItem}
                        onPress={onPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={24}
                            color={color}
                        />
                        <Text style={[styles.tabLabel, { color }]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function TabsLayout() {
    const { width } = useWindowDimensions();
    const segments = useSegments();
    const isWebDesktop = Platform.OS === 'web' && width >= 1024;

    // If web desktop, use WebLayout with active screen
    if (isWebDesktop) {
        const activeScreen = segments[segments.length - 1] || 'index';
        let ScreenComponent;
        switch (activeScreen) {
            case 'index':
                ScreenComponent = Index;
                break;
            case 'list':
                ScreenComponent = List;
                break;
            case 'add':
                ScreenComponent = Add;
                break;
            case 'reports':
                ScreenComponent = Reports;
                break;
            case 'settings':
                ScreenComponent = Settings;
                break;
            default:
                ScreenComponent = Index;
        }
        return (
            <WebLayout>
                <ScreenComponent />
            </WebLayout>
        );
    }

    // Mobile/Tablet/Web mobile: use bottom tabs
    return (
        <Tab.Navigator
            tabBarPosition="bottom"
            screenOptions={{
                swipeEnabled: Platform.OS !== 'web',
                tabBarShowLabel: false,
                tabBarIndicatorStyle: { height: 0 },
                tabBarStyle: { height: 0 },
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="index" component={Index} />
            <Tab.Screen name="list" component={List} />
            <Tab.Screen name="add" component={Add} />
            <Tab.Screen name="reports" component={Reports} />
            <Tab.Screen name="settings" component={Settings} />
        </Tab.Navigator>
    );
}
