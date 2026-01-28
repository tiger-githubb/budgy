import { useAuthStore } from '@/src/store/auth.store';
import React, { useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { initialize, isInitialized } = useAuthStore();

    useEffect(() => {
        if (!isInitialized) {
            initialize();
        }
    }, [initialize, isInitialized]);

    return <>{children}</>;
}
