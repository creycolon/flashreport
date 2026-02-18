import { PartnersScreen } from '../src/ui/screens/PartnersScreen';
import { Stack } from 'expo-router';

export default function PartnersPage() {
    return (
        <>
            <Stack.Screen options={{ title: 'Socios', headerShown: false }} />
            <PartnersScreen />
        </>
    );
}
