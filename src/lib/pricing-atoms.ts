import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Ocean rate interface
export interface OceanRate {
    id?: number;
    state: string;
    shorthand: string;
    rate: number;
}

// Default pricing state atom
export const defaultPricingAtom = atom({
    oceanRates: [] as OceanRate[],
    groundFeeAdjustment: 0,
    pickupSurcharge: 300,
    serviceFee: 100,
    hybridSurcharge: 150,
});

// Ocean rates management atoms
export const oceanRatesAtom = atom<OceanRate[]>([]);
export const editingRateAtom = atom<OceanRate | null>(null);
export const newRateAtom = atom<OceanRate>({
    state: "",
    shorthand: "",
    rate: 0,
});

// Loading and saving states
export const pricingLoadingAtom = atom(true);
export const pricingSavingAtom = atom(false);

// Active tab state (persisted in localStorage)
export const activeTabAtom = atomWithStorage('pricing-active-tab', 'default');

// User pricing management atoms
export const usersAtom = atom<any[]>([]);
export const userPricingAtom = atom<Record<string, any>>({});
export const userSearchTermAtom = atom('');
export const userLoadingAtom = atom(true);

// Filtered users derived atom
export const filteredUsersAtom = atom((get) => {
    const users = get(usersAtom);
    const searchTerm = get(userSearchTermAtom);

    if (!searchTerm) return users;

    return users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
});

// Pricing status derived atom
export const pricingStatusAtom = atom((get) => {
    const userPricing = get(userPricingAtom);

    return (userId: string) => {
        const pricing = userPricing[userId];
        if (!pricing) return "default";
        if (!pricing.isActive) return "inactive";
        return "custom";
    };
});

// Action atoms for default pricing
export const updateDefaultPricingFieldAtom = atom(
    null,
    (get, set, field: 'groundFeeAdjustment' | 'pickupSurcharge' | 'serviceFee' | 'hybridSurcharge', value: number) => {
        const currentPricing = get(defaultPricingAtom);
        set(defaultPricingAtom, {
            ...currentPricing,
            [field]: value,
        });
    }
);

export const setDefaultPricingAtom = atom(
    null,
    (get, set, pricing: { oceanRates: OceanRate[]; groundFeeAdjustment: number; pickupSurcharge: number; serviceFee: number; hybridSurcharge: number }) => {
    set(defaultPricingAtom, pricing);
}
);

// Action atoms for ocean rates
export const addOceanRateAtom = atom(
    null,
    (get, set, rate: OceanRate) => {
        const currentRates = get(oceanRatesAtom);
        set(oceanRatesAtom, [...currentRates, rate]);
    }
);

export const updateOceanRateAtom = atom(
    null,
    (get, set, updatedRate: OceanRate) => {
        const currentRates = get(oceanRatesAtom);
        const updatedRates = currentRates.map(rate =>
            rate.id === updatedRate.id ? updatedRate : rate
        );
        set(oceanRatesAtom, updatedRates);
    }
);

export const deleteOceanRateAtom = atom(
    null,
    (get, set, rateId: number) => {
        const currentRates = get(oceanRatesAtom);
        const filteredRates = currentRates.filter(rate => rate.id !== rateId);
        set(oceanRatesAtom, filteredRates);
    }
);

export const setOceanRatesAtom = atom(
    null,
    (get, set, rates: OceanRate[]) => {
        set(oceanRatesAtom, rates);
    }
);

export const setEditingRateAtom = atom(
    null,
    (get, set, rate: OceanRate | null) => {
        set(editingRateAtom, rate);
    }
);

export const updateNewRateFieldAtom = atom(
    null,
    (get, set, field: keyof OceanRate, value: string | number) => {
        const currentRate = get(newRateAtom);
        set(newRateAtom, {
            ...currentRate,
            [field]: value,
        });
    }
);

export const resetNewRateAtom = atom(
    null,
    (get, set) => {
        set(newRateAtom, {
            state: "",
            shorthand: "",
            rate: 0,
        });
    }
);

// Action atoms for user pricing
export const setUsersAtom = atom(
    null,
    (get, set, users: any[]) => {
        set(usersAtom, users);
    }
);

export const setUserPricingAtom = atom(
    null,
    (get, set, pricing: Record<string, any>) => {
        set(userPricingAtom, pricing);
    }
);

export const updateUserPricingAtom = atom(
    null,
    (get, set, userId: string, pricing: any) => {
        const currentPricing = get(userPricingAtom);
        set(userPricingAtom, {
            ...currentPricing,
            [userId]: pricing,
        });
    }
);

export const setUserSearchTermAtom = atom(
    null,
    (get, set, searchTerm: string) => {
        set(userSearchTermAtom, searchTerm);
    }
);

// Loading state atoms
export const setPricingLoadingAtom = atom(
    null,
    (get, set, loading: boolean) => {
        set(pricingLoadingAtom, loading);
    }
);

export const setPricingSavingAtom = atom(
    null,
    (get, set, saving: boolean) => {
        set(pricingSavingAtom, saving);
    }
);

export const setUserLoadingAtom = atom(
    null,
    (get, set, loading: boolean) => {
        set(userLoadingAtom, loading);
    }
);

// Tab management atom
export const setActiveTabAtom = atom(
    null,
    (get, set, tab: string) => {
        set(activeTabAtom, tab);
    }
);

// Utility atoms for formatting and display
export const formatOceanRatesAtom = atom((get) => {
    return (oceanRates: OceanRate[] | null | undefined) => {
        if (!oceanRates || oceanRates.length === 0) {
            return "Default";
        }

        if (oceanRates.length === 1) {
            return `${oceanRates[0].shorthand}: $${oceanRates[0].rate}`;
        }

        return `${oceanRates.length} rates configured`;
    };
});

export const getOceanRatesTooltipAtom = atom((get) => {
    return (oceanRates: OceanRate[] | null | undefined) => {
        if (!oceanRates || oceanRates.length === 0) {
            return "Using system default ocean rates";
        }

        return oceanRates.map(rate => `${rate.state}: $${rate.rate}`).join('\n');
    };
});

// Reset all pricing state atom
export const resetPricingStateAtom = atom(
    null,
    (get, set) => {
        set(defaultPricingAtom, {
            oceanRates: [],
            groundFeeAdjustment: 0,
            pickupSurcharge: 300,
            serviceFee: 100,
            hybridSurcharge: 150,
        });
        set(oceanRatesAtom, []);
        set(editingRateAtom, null);
        set(newRateAtom, {
            state: "",
            shorthand: "",
            rate: 0,
        });
        set(pricingLoadingAtom, true);
        set(pricingSavingAtom, false);
        set(usersAtom, []);
        set(userPricingAtom, {});
        set(userSearchTermAtom, '');
        set(userLoadingAtom, true);
    }
); 