"use client";

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import {
    adminUserDataAtom,
    adminUserCarsAtom,
    resetAdminUserUIStateAtom,
} from '@/lib/simplified-admin-user-atoms';
import { getUserAction } from '@/lib/actions/userActions';
import { useServerActionQuery } from '@/lib/hooks/server-action-hooks';

interface UserDataProviderProps {
    userId: string;
    children: React.ReactNode;
}

export function UserDataProvider({ userId, children }: UserDataProviderProps) {
    const [, setUserData] = useAtom(adminUserDataAtom);
    const [, setUserCars] = useAtom(adminUserCarsAtom);
    const [, resetUIState] = useAtom(resetAdminUserUIStateAtom);

    // Fetch user data via server action
    const {
        isLoading: userLoading,
        data: userData,
        error: userError,
    } = useServerActionQuery(getUserAction, {
        input: { id: userId },
        queryKey: ["getUser", userId],
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    // Fetch cars via REST API
    const [carsLoading, setCarsLoading] = useState(false);
    const [carsError, setCarsError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchCars = async () => {
            try {
                setCarsLoading(true);
                setCarsError(null);
                const res = await fetch(`/api/cars?ownerId=${encodeURIComponent(userId)}&pageSize=1000`);
                if (!res.ok) throw new Error('Failed to fetch cars');
                const json = await res.json();
                if (!cancelled) {
                    setUserCars(Array.isArray(json?.cars) ? json.cars : []);
                }
            } catch (err) {
                if (!cancelled) setCarsError(err instanceof Error ? err.message : 'Failed to fetch cars');
            } finally {
                if (!cancelled) setCarsLoading(false);
            }
        };
        fetchCars();
        return () => { cancelled = true; };
    }, [userId, setUserCars]);

    // Sync user data
    useEffect(() => {
        if (userError) {
            // Leave data as-is; Client will show ErrorState if no user data present
            return;
        }
        if (!userLoading && userData?.success && userData?.user) {
            setUserData(userData.user);
        }
    }, [userLoading, userData, userError, setUserData]);

    // Reset UI state when userId changes
    useEffect(() => {
        resetUIState();
    }, [userId, resetUIState]);

    return <>{children}</>;
}
