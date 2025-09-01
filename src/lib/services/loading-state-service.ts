"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Unified Loading State Service
 * 
 * This service provides a centralized way to manage loading states across the application.
 * It ensures consistent loading indicators, proper error handling, and better UX.
 * 
 * Key Features:
 * - Centralized loading state management
 * - Consistent loading indicators
 * - Smart loading state coordination
 * - Error state handling
 * - Performance optimized
 */

export interface LoadingState {
    isLoading: boolean;
    error: string | null;
    progress?: number; // For operations with progress tracking
}

export interface LoadingOptions {
    /** Minimum loading time to prevent flash (in ms) */
    minLoadingTime?: number;
    /** Whether to show error states */
    showErrors?: boolean;
    /** Custom error message */
    errorMessage?: string;
    /** Whether to retry on error */
    retryOnError?: boolean;
    /** Maximum retry attempts */
    maxRetries?: number;
}

export interface LoadingAction {
    id: string;
    type: 'query' | 'mutation' | 'upload' | 'download' | 'custom';
    state: LoadingState;
    options: LoadingOptions;
    startTime: number;
    retryCount: number;
}

/**
 * Loading State Service Class
 */
export class LoadingStateService {
    private loadingActions = new Map<string, LoadingAction>();
    private listeners = new Set<(actions: Map<string, LoadingAction>) => void>();
    private queryClient: ReturnType<typeof useQueryClient>;

    constructor(queryClient: ReturnType<typeof useQueryClient>) {
        this.queryClient = queryClient;
    }

    /**
     * Start a loading action
     */
    startLoading(
        id: string,
        type: LoadingAction['type'] = 'custom',
        options: LoadingOptions = {}
    ): void {
        const action: LoadingAction = {
            id,
            type,
            state: { isLoading: true, error: null },
            options: {
                minLoadingTime: 300,
                showErrors: true,
                retryOnError: false,
                maxRetries: 3,
                ...options
            },
            startTime: Date.now(),
            retryCount: 0
        };

        this.loadingActions.set(id, action);
        this.notifyListeners();
    }

    /**
     * Update loading progress
     */
    updateProgress(id: string, progress: number): void {
        const action = this.loadingActions.get(id);
        if (action) {
            action.state.progress = Math.min(100, Math.max(0, progress));
            this.notifyListeners();
        }
    }

    /**
     * Complete a loading action successfully
     */
    completeLoading(id: string): void {
        const action = this.loadingActions.get(id);
        if (!action) return;

        const elapsedTime = Date.now() - action.startTime;
        const minTime = action.options.minLoadingTime || 0;

        if (elapsedTime < minTime) {
            // Ensure minimum loading time for better UX
            setTimeout(() => {
                this.loadingActions.delete(id);
                this.notifyListeners();
            }, minTime - elapsedTime);
        } else {
            this.loadingActions.delete(id);
            this.notifyListeners();
        }
    }

    /**
     * Set error state for a loading action
     */
    setError(id: string, error: string): void {
        const action = this.loadingActions.get(id);
        if (!action) return;

        action.state.isLoading = false;
        action.state.error = error;
        action.state.progress = undefined;

        // Handle retry logic
        if (action.options.retryOnError && action.retryCount < (action.options.maxRetries || 3)) {
            action.retryCount++;
            // Auto-retry after a delay
            setTimeout(() => {
                action.state.isLoading = true;
                action.state.error = null;
                this.notifyListeners();
            }, 1000 * action.retryCount); // Exponential backoff
        } else {
            // Remove after error timeout
            setTimeout(() => {
                this.loadingActions.delete(id);
                this.notifyListeners();
            }, 5000);
        }

        this.notifyListeners();
    }

    /**
     * Get loading state for a specific action
     */
    getLoadingState(id: string): LoadingState | null {
        const action = this.loadingActions.get(id);
        return action ? action.state : null;
    }

    /**
     * Check if any loading actions are active
     */
    isAnyLoading(): boolean {
        return Array.from(this.loadingActions.values()).some(action => action.state.isLoading);
    }

    /**
     * Get all active loading actions
     */
    getActiveActions(): LoadingAction[] {
        return Array.from(this.loadingActions.values()).filter(action => action.state.isLoading);
    }

    /**
     * Get loading actions by type
     */
    getActionsByType(type: LoadingAction['type']): LoadingAction[] {
        return Array.from(this.loadingActions.values()).filter(action => action.type === type);
    }

    /**
     * Clear all loading actions
     */
    clearAll(): void {
        this.loadingActions.clear();
        this.notifyListeners();
    }

    /**
     * Subscribe to loading state changes
     */
    subscribe(listener: (actions: Map<string, LoadingAction>) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notify all listeners of state changes
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(new Map(this.loadingActions)));
    }

    /**
     * Smart loading coordination for React Query
     */
    coordinateWithReactQuery(
        queryKey: string[],
        isLoading: boolean,
        error: any,
        options: LoadingOptions = {}
    ): void {
        const id = `query_${queryKey.join('_')}`;

        if (isLoading) {
            this.startLoading(id, 'query', options);
        } else if (error) {
            this.setError(id, error.message || 'An error occurred');
        } else {
            this.completeLoading(id);
        }
    }

    /**
     * Smart loading coordination for server actions
     */
    coordinateWithServerAction(
        actionName: string,
        isPending: boolean,
        error: any,
        options: LoadingOptions = {}
    ): void {
        const id = `action_${actionName}`;

        if (isPending) {
            this.startLoading(id, 'mutation', options);
        } else if (error) {
            this.setError(id, error.message || 'Action failed');
        } else {
            this.completeLoading(id);
        }
    }
}

/**
 * Hook to use the loading state service
 */
export function useLoadingState() {
    const queryClient = useQueryClient();
    const [service] = useState(() => new LoadingStateService(queryClient));
    const [actions, setActions] = useState<Map<string, LoadingAction>>(new Map());

    useEffect(() => {
        const unsubscribe = service.subscribe(setActions);
        return unsubscribe;
    }, [service]);

    return {
        // Service methods
        startLoading: useCallback((id: string, type?: LoadingAction['type'], options?: LoadingOptions) =>
            service.startLoading(id, type, options), [service]),
        updateProgress: useCallback((id: string, progress: number) =>
            service.updateProgress(id, progress), [service]),
        completeLoading: useCallback((id: string) =>
            service.completeLoading(id), [service]),
        setError: useCallback((id: string, error: string) =>
            service.setError(id, error), [service]),

        // State getters
        getLoadingState: useCallback((id: string) =>
            service.getLoadingState(id), [service]),
        isAnyLoading: useCallback(() =>
            service.isAnyLoading(), [service]),
        getActiveActions: useCallback(() =>
            service.getActiveActions(), [service]),
        getActionsByType: useCallback((type: LoadingAction['type']) =>
            service.getActionsByType(type), [service]),

        // Coordination methods
        coordinateWithReactQuery: useCallback((
            queryKey: string[],
            isLoading: boolean,
            error: any,
            options?: LoadingOptions
        ) => service.coordinateWithReactQuery(queryKey, isLoading, error, options), [service]),

        coordinateWithServerAction: useCallback((
            actionName: string,
            isPending: boolean,
            error: any,
            options?: LoadingOptions
        ) => service.coordinateWithServerAction(actionName, isPending, error, options), [service]),

        // Current state
        actions,
        isLoading: service.isAnyLoading(),
        activeActions: service.getActiveActions(),
    };
}

/**
 * Hook for specific loading actions
 */
export function useLoadingAction(
    id: string,
    type: LoadingAction['type'] = 'custom',
    options: LoadingOptions = {}
) {
    const { startLoading, completeLoading, setError, getLoadingState } = useLoadingState();
    const loadingState = getLoadingState(id);

    const start = useCallback(() => startLoading(id, type, options), [id, type, options, startLoading]);
    const complete = useCallback(() => completeLoading(id), [id, completeLoading]);
    const error = useCallback((errorMessage: string) => setError(id, errorMessage), [id, setError]);

    return {
        loadingState,
        isLoading: loadingState?.isLoading || false,
        error: loadingState?.error || null,
        progress: loadingState?.progress,
        start,
        complete,
        setError: error,
    };
}

/**
 * Hook for React Query integration
 */
export function useQueryLoading(
    queryKey: string[],
    isLoading: boolean,
    error: any,
    options: LoadingOptions = {}
) {
    const { coordinateWithReactQuery } = useLoadingState();
    const id = `query_${queryKey.join('_')}`;

    useEffect(() => {
        coordinateWithReactQuery(queryKey, isLoading, error, options);
    }, [queryKey, isLoading, error, options, coordinateWithReactQuery]);

    return {
        id,
        isLoading,
        error: error?.message || null,
    };
}

/**
 * Hook for Server Action integration
 */
export function useServerActionLoading(
    actionName: string,
    isPending: boolean,
    error: any,
    options: LoadingOptions = {}
) {
    const { coordinateWithServerAction } = useLoadingState();
    const id = `action_${actionName}`;

    useEffect(() => {
        coordinateWithServerAction(actionName, isPending, error, options);
    }, [actionName, isPending, error, options, coordinateWithServerAction]);

    return {
        id,
        isLoading: isPending,
        error: error?.message || null,
    };
}
