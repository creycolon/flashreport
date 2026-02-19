import { useEffect, useState } from 'react';
import { configRepository } from '@core/infrastructure/repositories/configRepository';

export const useBusinessUnitName = () => {
    const [businessUnitName, setBusinessUnitName] = useState<string>('Negocio');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBusinessUnitName();
    }, []);

    const loadBusinessUnitName = async () => {
        try {
            const saved = await (configRepository as any).get('business_unit_name', 'Negocio');
            setBusinessUnitName(saved || 'Negocio');
        } catch (error) {
            console.error('Error loading business unit name:', error);
            setBusinessUnitName('Negocio');
        } finally {
            setLoading(false);
        }
    };

    const saveBusinessUnitName = async (name: string) => {
        try {
            await (configRepository as any).set('business_unit_name', name);
            setBusinessUnitName(name);
        } catch (error) {
            console.error('Error saving business unit name:', error);
        }
    };

    return {
        businessUnitName,
        setBusinessUnitName: saveBusinessUnitName,
        loading,
    };
};
