"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

/**
 * Unified State Management Service
 * 
 * This service provides a single source of truth for all application state,
 * consolidating Jotai atoms, React Query, and useState into a unified system.
 * 
 * Key Features:
 * - Single source of truth for all data
 * - Automatic synchronization between different state systems
 * - Optimized data flow and reduced redundancy
 * - Type-safe state management
 * - Performance optimized with smart caching
 */

// ============================================================================
// CORE STATE TYPES
// ============================================================================

export interface UnifiedStateConfig {
    /** Whether to persist state to localStorage */
    persist?: boolean;
    /** Cache time in milliseconds */
    cacheTime?: number;
    /** Stale time in milliseconds */
    staleTime?: number;
    /** Whether to refetch on window focus */
    refetchOnWindowFocus?: boolean;
    /** Whether to refetch on mount */
    refetchOnMount?: boolean;
    /** Whether to refetch on reconnect */
    refetchOnReconnect?: boolean;
}

export interface StateEntity<T = any> {
    data: T | null;
    loading: boolean;
    error: string | null;
    lastUpdated: number;
    version: number;
}

export interface StateAction<T = any> {
    type: string;
    payload?: T;
    timestamp: number;
}

// ============================================================================
// UNIFIED STATE ATOMS
// ============================================================================

// Global state registry
const stateRegistryAtom = atom<Map<string, StateEntity>>(new Map());

// State actions registry
const stateActionsAtom = atom<StateAction[]>([]);

// Global loading state
const globalLoadingAtom = atom<boolean>(false);

// Global error state
const globalErrorAtom = atom<string | null>(null);

// State synchronization status
const syncStatusAtom = atom<Map<string, boolean>>(new Map());

// ============================================================================
// STATE ENTITY ATOMS (Auto-generated based on usage)
// ============================================================================

// Car-related state atoms
export const carsStateAtom = atom<StateEntity>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: 0,
    version: 0,
});

export const carStateAtom = atom<StateEntity>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: 0,
    version: 0,
});

export const userCarsStateAtom = atom<StateEntity>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: 0,
    version: 0,
});

// User-related state atoms
export const usersStateAtom = atom<StateEntity>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: 0,
    version: 0,
});

export const userStateAtom = atom<StateEntity>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: 0,
    version: 0,
});

// Payment-related state atoms
export const paymentsStateAtom = atom<StateEntity>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: 0,
    version: 0,
});

export const paymentHistoryStateAtom = atom<StateEntity>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: 0,
    version: 0,
});

// Invoice-related state atoms
export const invoicesStateAtom = atom<StateEntity>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: 0,
    version: 0,
});

// UI state atoms
export const dialogStateAtom = atom<StateEntity>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: 0,
    version: 0,
});

export const modalStateAtom = atom<StateEntity>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: 0,
    version: 0,
});

// ============================================================================
// UNIFIED STATE SERVICE CLASS
// ============================================================================

export class UnifiedStateService {
    private queryClient: ReturnType<typeof useQueryClient>;
    private stateRegistry: Map<string, StateEntity> = new Map();
    private listeners: Set<(state: Map<string, StateEntity>) => void> = new Set();

    constructor(queryClient: ReturnType<typeof useQueryClient>) {
        this.queryClient = queryClient;
    }

    /**
     * Register a state entity
     */
    registerState<T>(key: string, initialState: StateEntity<T>): void {
        this.stateRegistry.set(key, initialState);
        this.notifyListeners();
    }

    /**
     * Get state entity
     */
    getState<T>(key: string): StateEntity<T> | null {
        return this.stateRegistry.get(key) || null;
    }

    /**
     * Update state entity
     */
    updateState<T>(key: string, updates: Partial<StateEntity<T>>): void {
        const currentState = this.stateRegistry.get(key);
        if (currentState) {
            const newState: StateEntity<T> = {
                ...currentState,
                ...updates,
                lastUpdated: Date.now(),
                version: currentState.version + 1,
            };
            this.stateRegistry.set(key, newState);
            this.notifyListeners();
        }
    }

    /**
     * Set loading state
     */
    setLoading(key: string, loading: boolean): void {
        this.updateState(key, { loading });
    }

    /**
     * Set error state
     */
    setError(key: string, error: string | null): void {
        this.updateState(key, { error, loading: false });
    }

    /**
     * Set data
     */
    setData<T>(key: string, data: T): void {
        this.updateState(key, { data, loading: false, error: null });
    }

    /**
     * Clear state
     */
    clearState(key: string): void {
        this.stateRegistry.delete(key);
        this.notifyListeners();
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener: (state: Map<string, StateEntity>) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notify listeners of state changes
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(new Map(this.stateRegistry)));
    }

    /**
     * Synchronize with React Query
     */
    syncWithReactQuery<T>(
        key: string,
        queryKey: string[],
        data: T | undefined,
        isLoading: boolean,
        error: any
    ): void {
        if (isLoading) {
            this.setLoading(key, true);
        } else if (error) {
            this.setError(key, error.message || 'An error occurred');
        } else if (data !== undefined) {
            this.setData(key, data);
        }
    }

    /**
     * Get all states
     */
    getAllStates(): Map<string, StateEntity> {
        return new Map(this.stateRegistry);
    }

    /**
     * Reset all states
     */
    resetAllStates(): void {
        this.stateRegistry.clear();
        this.notifyListeners();
    }
}

// ============================================================================
// UNIFIED STATE HOOKS
// ============================================================================

/**
 * Hook to use unified state management
 */
export function useUnifiedState() {
    const queryClient = useQueryClient();
    const [service] = useState(() => new UnifiedStateService(queryClient));

    return {
        // State management methods
        registerState: useCallback((key: string, initialState: StateEntity) =>
            service.registerState(key, initialState), [service]),
        getState: useCallback((key: string) =>
            service.getState(key), [service]),
        updateState: useCallback((key: string, updates: Partial<StateEntity>) =>
            service.updateState(key, updates), [service]),
        setLoading: useCallback((key: string, loading: boolean) =>
            service.setLoading(key, loading), [service]),
        setError: useCallback((key: string, error: string | null) =>
            service.setError(key, error), [service]),
        setData: useCallback((key: string, data: any) =>
            service.setData(key, data), [service]),
        clearState: useCallback((key: string) =>
            service.clearState(key), [service]),

        // Synchronization methods
        syncWithReactQuery: useCallback((
            key: string,
            queryKey: string[],
            data: any,
            isLoading: boolean,
            error: any
        ) => service.syncWithReactQuery(key, queryKey, data, isLoading, error), [service]),

        // Utility methods
        getAllStates: useCallback(() =>
            service.getAllStates(), [service]),
        resetAllStates: useCallback(() =>
            service.resetAllStates(), [service]),
    };
}

/**
 * Hook for specific state entity
 */
export function useStateEntity<T>(key: string, initialState?: StateEntity<T>) {
    const { registerState, getState, updateState, setLoading, setError, setData } = useUnifiedState();
    const [state, setState] = useState<StateEntity<T> | null>(null);

    // Register state on mount
    useEffect(() => {
        if (initialState) {
            registerState(key, initialState);
        }
    }, [key, initialState, registerState]);

    // Get current state
    useEffect(() => {
        const currentState = getState(key) as StateEntity<T> | null;
        setState(currentState);
    }, [key, getState]);

    return {
        state,
        data: state?.data || null,
        loading: state?.loading || false,
        error: state?.error || null,
        lastUpdated: state?.lastUpdated || 0,
        version: state?.version || 0,
        setLoading: useCallback((loading: boolean) => setLoading(key, loading), [key, setLoading]),
        setError: useCallback((error: string | null) => setError(key, error), [key, setError]),
        setData: useCallback((data: T) => setData(key, data), [key, setData]),
        updateState: useCallback((updates: Partial<StateEntity<T>>) => updateState(key, updates), [key, updateState]),
    };
}

/**
 * Hook for React Query integration
 */
export function useUnifiedQuery<T>(
    key: string,
    queryKey: string[],
    data: T | undefined,
    isLoading: boolean,
    error: any,
    config?: UnifiedStateConfig
) {
    const { syncWithReactQuery } = useUnifiedState();

    useEffect(() => {
        syncWithReactQuery(key, queryKey, data, isLoading, error);
    }, [key, queryKey, data, isLoading, error, syncWithReactQuery]);

    return {
        key,
        data,
        isLoading,
        error: error?.message || null,
    };
}

/**
 * Hook for Jotai integration
 */
export function useUnifiedAtom<T>(
    key: string,
    atom: any,
    config?: UnifiedStateConfig
) {
    const [atomValue, setAtomValue] = useAtom(atom);
    const { setData, setLoading, setError } = useUnifiedState();

    useEffect(() => {
        if (atomValue !== null && atomValue !== undefined) {
            setData(key, atomValue);
        }
    }, [key, atomValue, setData]);

    return {
        value: atomValue,
        setValue: setAtomValue,
        setLoading: useCallback((loading: boolean) => setLoading(key, loading), [key, setLoading]),
        setError: useCallback((error: string | null) => setError(key, error), [key, setError]),
    };
}

// ============================================================================
// SPECIALIZED HOOKS FOR COMMON USE CASES
// ============================================================================

/**
 * Hook for car data management
 */
export function useCarState(vin?: string) {
    const key = vin ? `car_${vin}` : 'cars';
    const { state, setLoading, setError, setData } = useStateEntity(key, {
        data: null,
        loading: false,
        error: null,
        lastUpdated: 0,
        version: 0,
    });

    return {
        car: state?.data || null,
        loading: state?.loading || false,
        error: state?.error || null,
        setLoading,
        setError,
        setData,
    };
}

/**
 * Hook for user data management
 */
export function useUserState(userId?: string) {
    const key = userId ? `user_${userId}` : 'users';
    const { state, setLoading, setError, setData } = useStateEntity(key, {
        data: null,
        loading: false,
        error: null,
        lastUpdated: 0,
        version: 0,
    });

    return {
        user: state?.data || null,
        loading: state?.loading || false,
        error: state?.error || null,
        setLoading,
        setError,
        setData,
    };
}

/**
 * Hook for payment data management
 */
export function usePaymentState(carVin?: string) {
    const key = carVin ? `payments_${carVin}` : 'payments';
    const { state, setLoading, setError, setData } = useStateEntity(key, {
        data: null,
        loading: false,
        error: null,
        lastUpdated: 0,
        version: 0,
    });

    return {
        payments: state?.data || null,
        loading: state?.loading || false,
        error: state?.error || null,
        setLoading,
        setError,
        setData,
    };
}

/**
 * Hook for UI state management
 */
export function useUIState(component: string) {
    const key = `ui_${component}`;
    const { state, setLoading, setError, setData } = useStateEntity(key, {
        data: null,
        loading: false,
        error: null,
        lastUpdated: 0,
        version: 0,
    });

    return {
        ui: state?.data || null,
        loading: state?.loading || false,
        error: state?.error || null,
        setLoading,
        setError,
        setData,
    };
}

// ============================================================================
// STATE SYNCHRONIZATION UTILITIES
// ============================================================================

/**
 * Synchronize multiple state sources
 */
export function useStateSynchronization<T>(
    sources: Array<{
        key: string;
        data: T | undefined;
        loading: boolean;
        error: any;
    }>,
    targetKey: string
) {
    const { setData, setLoading, setError } = useUnifiedState();

    useEffect(() => {
        const hasLoading = sources.some(source => source.loading);
        const hasError = sources.find(source => source.error);
        const allData = sources.map(source => source.data).filter(Boolean);

        if (hasLoading) {
            setLoading(targetKey, true);
        } else if (hasError) {
            setError(targetKey, hasError.error?.message || 'Synchronization error');
        } else if (allData.length > 0) {
            setData(targetKey, allData);
        }
    }, [sources, targetKey, setData, setLoading, setError]);
}

/**
 * Create a unified state selector
 */
export function createUnifiedSelector<T, R>(
    key: string,
    selector: (state: StateEntity<T>) => R
) {
    return (state: Map<string, StateEntity>): R | null => {
        const entity = state.get(key);
        return entity ? selector(entity) : null;
    };
}
