"use client";

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { z } from 'zod';
import { selectUserSchema, selectCarSchema } from '@/lib/drizzle/schema';
import {
    adminUserDataAtom,
    adminUserCarsAtom,
    resetAdminUserUIStateAtom,
} from '@/lib/simplified-admin-user-atoms';

interface UserDataProviderProps {
    userId: string;
    userData: z.infer<typeof selectUserSchema>;
    carsData: z.infer<typeof selectCarSchema>[];
    children: React.ReactNode;
}

export function UserDataProvider({ userId, userData, carsData, children }: UserDataProviderProps) {
    const [, setUserData] = useAtom(adminUserDataAtom);
    const [, setUserCars] = useAtom(adminUserCarsAtom);
    const [, resetUIState] = useAtom(resetAdminUserUIStateAtom);

    // Set data from props (no fetching needed)
    useEffect(() => {
        setUserData(userData);
        setUserCars(carsData);
    }, [userData, carsData, setUserData, setUserCars]);

    // Reset UI state when userId changes
    useEffect(() => {
        resetUIState();
    }, [userId, resetUIState]);

    return <>{children}</>;
}
