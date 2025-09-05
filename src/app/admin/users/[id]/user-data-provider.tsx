"use client";

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import {
    adminUserDataAtom,
    adminUserCarsAtom,
    resetAdminUserUIStateAtom,
} from '@/lib/simplified-admin-user-atoms';
// Replaced server action with direct REST fetch to avoid POSTs on page route

interface UserDataProviderProps {
    userId: string;
    children: React.ReactNode;
}

export function UserDataProvider({ userId, children }: UserDataProviderProps) {
    const [, setUserData] = useAtom(adminUserDataAtom);
    const [, setUserCars] = useAtom(adminUserCarsAtom);
    const [, resetUIState] = useAtom(resetAdminUserUIStateAtom);

    // Fetch user data via REST API (avoids server action POSTs to the page route)
    useEffect(() => {
        let cancelled = false;
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
                    cache: 'no-store',
                });
                if (!res.ok) throw new Error('Failed to fetch user');
                const json = await res.json();
                if (!cancelled && json?.user) {
                    setUserData(json.user);
                }
            } catch (err) {
                // Silent failure; Client will show Loading/Error states accordingly
            }
        };
        fetchUser();
        return () => { cancelled = true; };
    }, [userId, setUserData]);

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

    // No additional sync needed; user data is set in fetch effect above

    // Reset UI state when userId changes
    useEffect(() => {
        resetUIState();
    }, [userId, resetUIState]);

    return <>{children}</>;
}
