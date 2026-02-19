import React, { useEffect } from 'react';

interface AppInitializerProps {
    children: React.ReactNode;
    onInitialized?: (result: {
        success: boolean;
        hasManagingPartner: boolean;
        hasBasicData: boolean;
        message?: string;
    }) => void;
    silent?: boolean;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({
    children,
    onInitialized,
    silent = false
}) => {
    console.error('🔴 APP INITIALIZER: Skipping initialization for debugging');
    
    // Skip initialization for debugging
    useEffect(() => {
        console.error('🔴 APP INITIALIZER: useEffect - skipping init');
        if (onInitialized) {
            onInitialized({
                success: true,
                hasManagingPartner: true,
                hasBasicData: true,
                message: 'Skipped for debugging'
            });
        }
    }, [onInitialized]);
    
    return <>{children}</>;
};

