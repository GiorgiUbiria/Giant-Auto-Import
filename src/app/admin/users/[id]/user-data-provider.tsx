"use client";

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { getUserAction } from '@/lib/actions/userActions';
import { useServerActionQuery } from '@/lib/hooks/server-action-hooks';
import {
    adminUserDataAtom,
    adminUserCarsAtom,
    adminUserLoadingAtom,
    adminUserCarsLoadingAtom,
    adminUserErrorAtom,
    setAdminUserDataAtom,
    setAdminUserCarsAtom,
    setAdminUserErrorAtom,
    setAdminUserLoadingAtom,
    setAdminUserCarsLoadingAtom,
    resetAdminUserStateAtom,
} from '@/lib/admin-user-atoms';

interface UserDataProviderProps {
    userId: string;
    children: React.ReactNode;
}

export function UserDataProvider({ userId, children }: UserDataProviderProps) {
    const [, resetState] = useAtom(resetAdminUserStateAtom);
    const [, setUserData] = useAtom(setAdminUserDataAtom);
    const [, setUserCars] = useAtom(setAdminUserCarsAtom);
    const [, setError] = useAtom(setAdminUserErrorAtom);
    const [, setLoading] = useAtom(setAdminUserLoadingAtom);
    const [, setCarsLoading] = useAtom(setAdminUserCarsLoadingAtom);

    // Fetch user data
    const {
        isLoading: userLoading,
        data: userData,
        error: userError
    } = useServerActionQuery(getUserAction, {
        input: { id: userId },
        queryKey: ["getUser", userId],
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: true, // Changed to true to ensure data loads on mount
        refetchOnReconnect: false,
    });

    // Fetch user cars separately using useEffect and fetch
    const [carsLoading, setCarsLoadingLocal] = useState(false);
    const [carsData, setCarsData] = useState<any>(null);
    const [carsError, setCarsError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                setCarsLoadingLocal(true);
                setCarsError(null);
                const response = await fetch(`/api/cars?ownerId=${userId}&pageSize=1000`);
                if (!response.ok) throw new Error('Failed to fetch cars');
                const data = await response.json();
                setCarsData(data);
            } catch (err) {
                setCarsError(err instanceof Error ? err : new Error('Failed to fetch cars'));
            } finally {
                setCarsLoadingLocal(false);
            }
        };

        fetchCars();
    }, [userId]);

    // Sync user data with Jotai state
    useEffect(() => {
        setLoading(userLoading);

        if (userError) {
            setError(userError.message || 'Failed to fetch user data');
        } else if (userData?.success && userData?.user) {
            setUserData(userData.user);
        }
    }, [userLoading, userData, userError, setLoading, setUserData, setError]);

    // Sync cars data with Jotai state
    useEffect(() => {
        setCarsLoading(carsLoading);

        if (carsError) {
            console.error('Failed to fetch user cars:', carsError);
        } else if (carsData?.cars) {
            setUserCars(carsData.cars);
        }
    }, [carsLoading, carsData, carsError, setCarsLoading, setUserCars]);

    // Reset state when userId changes
    useEffect(() => {
        resetState();
        // Set loading to true when userId changes to show loading state
        setLoading(true);
        setCarsLoading(true);
    }, [userId, resetState, setLoading, setCarsLoading]);

    return <>{children}</>;
}
