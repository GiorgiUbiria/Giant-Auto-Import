"use client";

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { UnifiedStateService } from './unified-state-service';

/**
 * State Migration Service
 * 
 * This service provides a gradual migration path from the current mixed state management
 * (Jotai + React Query + useState) to the unified state system.
 * 
 * Migration Strategy:
 * 1. Create bridge hooks that work with both old and new systems
 * 2. Gradually replace old state management with unified system
 * 3. Maintain backward compatibility during transition
 * 4. Provide migration utilities and validation
 */

// ============================================================================
// MIGRATION CONFIGURATION
// ============================================================================

export interface MigrationConfig {
    /** Whether to enable gradual migration */
    enableMigration: boolean;
    /** Whether to log migration activities */
    enableLogging: boolean;
    /** Migration priority order */
    priority: string[];
    /** Rollback configuration */
    rollback: {
        enabled: boolean;
        threshold: number; // Error threshold before rollback
    };
}

export interface MigrationStatus {
    completed: string[];
    inProgress: string[];
    failed: string[];
    pending: string[];
}

// ============================================================================
// BRIDGE HOOKS (Backward Compatibility)
// ============================================================================

/**
 * Bridge hook for Jotai atoms
 * Provides unified interface while maintaining Jotai functionality
 */
export function useJotaiBridge<T>(
    atom: any,
    unifiedKey: string,
    config?: MigrationConfig
) {
    const [atomValue, setAtomValue] = useAtom(atom);
    const [unifiedState, setUnifiedState] = useState<T | null>(null);
    const [isMigrated, setIsMigrated] = useState(false);

    // Sync Jotai atom with unified state
    useEffect(() => {
        if (config?.enableMigration && !isMigrated) {
            setUnifiedState(atomValue);
            setIsMigrated(true);
        }
    }, [atomValue, config?.enableMigration, isMigrated]);

    return {
        value: config?.enableMigration ? unifiedState : atomValue,
        setValue: config?.enableMigration ? setUnifiedState : setAtomValue,
        isMigrated,
        migrate: () => setIsMigrated(true),
        rollback: () => setIsMigrated(false),
    };
}

/**
 * Bridge hook for React Query
 * Provides unified interface while maintaining React Query functionality
 */
export function useReactQueryBridge<T>(
    queryKey: string[],
    data: T | undefined,
    isLoading: boolean,
    error: any,
    unifiedKey: string,
    config?: MigrationConfig
) {
    const [unifiedData, setUnifiedData] = useState<T | undefined>(undefined);
    const [unifiedLoading, setUnifiedLoading] = useState(false);
    const [unifiedError, setUnifiedError] = useState<any>(null);
    const [isMigrated, setIsMigrated] = useState(false);

    // Sync React Query with unified state
    useEffect(() => {
        if (config?.enableMigration && !isMigrated) {
            setUnifiedData(data);
            setUnifiedLoading(isLoading);
            setUnifiedError(error);
            setIsMigrated(true);
        }
    }, [data, isLoading, error, config?.enableMigration, isMigrated]);

    return {
        data: config?.enableMigration ? unifiedData : data,
        isLoading: config?.enableMigration ? unifiedLoading : isLoading,
        error: config?.enableMigration ? unifiedError : error,
        isMigrated,
        migrate: () => setIsMigrated(true),
        rollback: () => setIsMigrated(false),
    };
}

/**
 * Bridge hook for useState
 * Provides unified interface while maintaining useState functionality
 */
export function useStateBridge<T>(
    initialValue: T,
    unifiedKey: string,
    config?: MigrationConfig
) {
    const [stateValue, setStateValue] = useState<T>(initialValue);
    const [unifiedValue, setUnifiedValue] = useState<T>(initialValue);
    const [isMigrated, setIsMigrated] = useState(false);

    // Sync useState with unified state
    useEffect(() => {
        if (config?.enableMigration && !isMigrated) {
            setUnifiedValue(stateValue);
            setIsMigrated(true);
        }
    }, [stateValue, config?.enableMigration, isMigrated]);

    return {
        value: config?.enableMigration ? unifiedValue : stateValue,
        setValue: config?.enableMigration ? setUnifiedValue : setStateValue,
        isMigrated,
        migrate: () => setIsMigrated(true),
        rollback: () => setIsMigrated(false),
    };
}

// ============================================================================
// MIGRATION SERVICE CLASS
// ============================================================================

export class StateMigrationService {
    private queryClient: ReturnType<typeof useQueryClient>;
    private unifiedService: UnifiedStateService;
    private config: MigrationConfig;
    private status: MigrationStatus = {
        completed: [],
        inProgress: [],
        failed: [],
        pending: [],
    };

    constructor(
        queryClient: ReturnType<typeof useQueryClient>,
        unifiedService: UnifiedStateService,
        config: MigrationConfig
    ) {
        this.queryClient = queryClient;
        this.unifiedService = unifiedService;
        this.config = config;
    }

    /**
     * Start migration for a specific state key
     */
    async migrateState(
        key: string,
        source: 'jotai' | 'react-query' | 'useState',
        data?: any
    ): Promise<boolean> {
        try {
            this.status.inProgress.push(key);
            this.log(`Starting migration for ${key} from ${source}`);

            // Validate source data
            if (!this.validateSourceData(key, source, data)) {
                throw new Error(`Invalid source data for ${key}`);
            }

            // Migrate data to unified state
            await this.performMigration(key, source, data);

            // Update status
            this.status.inProgress = this.status.inProgress.filter(k => k !== key);
            this.status.completed.push(key);
            this.log(`Successfully migrated ${key}`);

            return true;
        } catch (error) {
            this.status.inProgress = this.status.inProgress.filter(k => k !== key);
            this.status.failed.push(key);
            this.log(`Failed to migrate ${key}: ${error}`);

            if (this.config.rollback.enabled) {
                await this.rollbackMigration(key);
            }

            return false;
        }
    }

    /**
     * Validate source data before migration
     */
    private validateSourceData(
        key: string,
        source: string,
        data: any
    ): boolean {
        // Basic validation logic
        if (source === 'jotai' && data === undefined) {
            return false;
        }
        if (source === 'react-query' && data === null) {
            return false;
        }
        return true;
    }

    /**
     * Perform the actual migration
     */
    private async performMigration(
        key: string,
        source: string,
        data: any
    ): Promise<void> {
        // Register state in unified system
        this.unifiedService.registerState(key, {
            data,
            loading: false,
            error: null,
            lastUpdated: Date.now(),
            version: 0,
        });

        // Invalidate React Query cache if migrating from React Query
        if (source === 'react-query') {
            await this.queryClient.invalidateQueries({ queryKey: [key] });
        }
    }

    /**
     * Rollback migration
     */
    private async rollbackMigration(key: string): Promise<void> {
        this.log(`Rolling back migration for ${key}`);
        this.unifiedService.clearState(key);
        this.status.failed = this.status.failed.filter(k => k !== key);
    }

    /**
     * Get migration status
     */
    getStatus(): MigrationStatus {
        return { ...this.status };
    }

    /**
     * Get migration progress
     */
    getProgress(): number {
        const total = this.status.completed.length + this.status.failed.length + this.status.inProgress.length;
        return total > 0 ? (this.status.completed.length / total) * 100 : 0;
    }

    /**
     * Reset migration status
     */
    resetStatus(): void {
        this.status = {
            completed: [],
            inProgress: [],
            failed: [],
            pending: [],
        };
    }

    /**
     * Log migration activity
     */
    private log(message: string): void {
        if (this.config.enableLogging) {
            console.log(`[StateMigration] ${message}`);
        }
    }
}

// ============================================================================
// MIGRATION HOOKS
// ============================================================================

/**
 * Hook to use state migration service
 */
export function useStateMigration(config?: Partial<MigrationConfig>) {
    const queryClient = useQueryClient();
    const [unifiedService] = useState(() => new UnifiedStateService(queryClient));

    const defaultConfig: MigrationConfig = {
        enableMigration: true,
        enableLogging: true,
        priority: ['cars', 'users', 'payments', 'invoices', 'ui'],
        rollback: {
            enabled: true,
            threshold: 3,
        },
        ...config,
    };

    const [migrationService] = useState(() =>
        new StateMigrationService(queryClient, unifiedService, defaultConfig)
    );

    return {
        // Migration methods
        migrateState: useCallback((
            key: string,
            source: 'jotai' | 'react-query' | 'useState',
            data?: any
        ) => migrationService.migrateState(key, source, data), [migrationService]),

        // Status methods
        getStatus: useCallback(() => migrationService.getStatus(), [migrationService]),
        getProgress: useCallback(() => migrationService.getProgress(), [migrationService]),
        resetStatus: useCallback(() => migrationService.resetStatus(), [migrationService]),

        // Unified service
        unifiedService,
    };
}

/**
 * Hook for gradual component migration
 */
export function useComponentMigration(
    componentName: string,
    stateKeys: string[],
    config?: Partial<MigrationConfig>
) {
    const { migrateState, getStatus, getProgress } = useStateMigration(config);
    const [isMigrating, setIsMigrating] = useState(false);

    const startMigration = useCallback(async () => {
        setIsMigrating(true);
        try {
            for (const key of stateKeys) {
                await migrateState(key, 'jotai'); // Default to jotai migration
            }
        } finally {
            setIsMigrating(false);
        }
    }, [stateKeys, migrateState]);

    return {
        startMigration,
        isMigrating,
        status: getStatus(),
        progress: getProgress(),
    };
}

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

/**
 * Create a migration wrapper for existing components
 */
export function withMigration<T extends React.ComponentType<any>>(
    Component: T,
    migrationConfig: {
        stateKeys: string[];
        priority: number;
    }
): T {
    return ((props: any) => {
        const { startMigration, isMigrating } = useComponentMigration(
            Component.displayName || Component.name,
            migrationConfig.stateKeys
        );

        useEffect(() => {
            startMigration();
        }, [startMigration]);

        return <Component { ...props } isMigrating = { isMigrating } />;
    }) as T;
}

/**
 * Migration validation utility
 */
export function validateMigration(
    oldState: any,
    newState: any,
    tolerance: number = 0.1
): boolean {
    // Basic validation logic
    if (typeof oldState !== typeof newState) {
        return false;
    }

    if (Array.isArray(oldState) && Array.isArray(newState)) {
        return oldState.length === newState.length;
    }

    if (typeof oldState === 'object' && typeof newState === 'object') {
        const oldKeys = Object.keys(oldState);
        const newKeys = Object.keys(newState);
        return oldKeys.length === newKeys.length;
    }

    return true;
}

/**
 * Migration performance monitor
 */
export function useMigrationPerformance() {
    const [metrics, setMetrics] = useState({
        startTime: 0,
        endTime: 0,
        duration: 0,
        memoryUsage: 0,
    });

    const startMonitoring = useCallback(() => {
        setMetrics(prev => ({
            ...prev,
            startTime: performance.now(),
        }));
    }, []);

    const endMonitoring = useCallback(() => {
        setMetrics(prev => ({
            ...prev,
            endTime: performance.now(),
            duration: performance.now() - prev.startTime,
            memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        }));
    }, []);

    return {
        metrics,
        startMonitoring,
        endMonitoring,
    };
}
