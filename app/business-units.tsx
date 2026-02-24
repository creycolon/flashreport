import React from 'react';
import { BusinessUnitsScreen } from '../src/features/business-units/BusinessUnitsScreen';

// Expo Router will map this file to the "/business-units" path.
// The component simply renders the existing BusinessUnitsScreen.
export default function BusinessUnitsRoute() {
    return <BusinessUnitsScreen />;
}
