import { BusinessUnitsScreen } from '../src/ui/screens/BusinessUnitsScreen';
import { Stack } from 'expo-router';

export default function BusinessUnitsPage() {
    return (
        <>
            <Stack.Screen options={{ title: 'Locales', headerShown: false }} />
            <BusinessUnitsScreen />
        </>
    );
}
