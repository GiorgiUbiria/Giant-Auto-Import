"use client";

import { useQueryClient } from '@tanstack/react-query';

/**
 * Centralized Cache Invalidation Service
 * 
 * This service provides a single point of control for all cache invalidation
 * across the application. It ensures that when data changes in one place,
 * all related views are updated consistently.
 * 
 * Key Features:
 * - Smart invalidation based on data relationships
 * - Batch invalidation for performance
 * - Consistent invalidation patterns
 * - Type-safe invalidation keys
 */

export interface CacheInvalidationOptions {
    /** Whether to refetch data immediately after invalidation */
    refetch?: boolean;
    /** Whether to invalidate only active queries */
    activeOnly?: boolean;
    /** Custom query keys to invalidate */
    customKeys?: string[][];
}

export interface CarDataChange {
    vin: string;
    ownerId?: string | null;
    changeType: 'create' | 'update' | 'delete' | 'owner_change' | 'payment' | 'invoice';
}

export interface UserDataChange {
    userId: string;
    changeType: 'create' | 'update' | 'delete' | 'car_assignment';
}

export interface PaymentDataChange {
    carVin: string;
    paymentType?: 'PURCHASE' | 'SHIPPING';
    changeType: 'create' | 'update' | 'delete';
}

export interface InvoiceDataChange {
    carVin: string;
    invoiceType: 'PURCHASE' | 'SHIPPING' | 'TOTAL';
    changeType: 'create' | 'update' | 'delete';
}

/**
 * Cache Invalidation Service Class
 */
export class CacheInvalidationService {
    private queryClient: ReturnType<typeof useQueryClient>;

    constructor(queryClient: ReturnType<typeof useQueryClient>) {
        this.queryClient = queryClient;
    }

    /**
     * Invalidate all car-related queries
     */
    async invalidateCarQueries(options: CacheInvalidationOptions = {}) {
        const { refetch = true, activeOnly = true } = options;

        // Invalidate all car queries
        await this.queryClient.invalidateQueries({
            queryKey: ['getCars'],
            exact: false,
            refetchType: activeOnly ? 'active' : 'all',
        });

        // Invalidate specific car queries
        await this.queryClient.invalidateQueries({
            queryKey: ['getCar'],
            exact: false,
            refetchType: activeOnly ? 'active' : 'all',
        });

        // Invalidate car public queries
        await this.queryClient.invalidateQueries({
            queryKey: ['getCarPublic'],
            exact: false,
            refetchType: activeOnly ? 'active' : 'all',
        });

        if (refetch) {
            await this.queryClient.refetchQueries({
                queryKey: ['getCars'],
                exact: false,
                type: 'active',
            });
        }
    }

    /**
     * Invalidate user-related queries
     */
    async invalidateUserQueries(userId?: string, options: CacheInvalidationOptions = {}) {
        const { refetch = true, activeOnly = true } = options;

        if (userId) {
            // Invalidate specific user queries
            await this.queryClient.invalidateQueries({
                queryKey: ['getUser', userId],
                exact: false,
                refetchType: activeOnly ? 'active' : 'all',
            });

            // Invalidate user cars queries
            await this.queryClient.invalidateQueries({
                queryKey: ['getCarsForUser', userId],
                exact: false,
                refetchType: activeOnly ? 'active' : 'all',
            });
        } else {
            // Invalidate all user queries
            await this.queryClient.invalidateQueries({
                queryKey: ['getUser'],
                exact: false,
                refetchType: activeOnly ? 'active' : 'all',
            });

            await this.queryClient.invalidateQueries({
                queryKey: ['getCarsForUser'],
                exact: false,
                refetchType: activeOnly ? 'active' : 'all',
            });
        }

        if (refetch) {
            await this.queryClient.refetchQueries({
                queryKey: userId ? ['getUser', userId] : ['getUser'],
                exact: false,
                type: 'active',
            });
        }
    }

    /**
     * Invalidate payment-related queries
     */
    async invalidatePaymentQueries(carVin?: string, options: CacheInvalidationOptions = {}) {
        const { refetch = true, activeOnly = true } = options;

        if (carVin) {
            // Invalidate specific car payment queries
            await this.queryClient.invalidateQueries({
                queryKey: ['paymentHistory', carVin],
                exact: false,
                refetchType: activeOnly ? 'active' : 'all',
            });

            await this.queryClient.invalidateQueries({
                queryKey: ['paymentSummary', carVin],
                exact: false,
                refetchType: activeOnly ? 'active' : 'all',
            });
        } else {
            // Invalidate all payment queries
            await this.queryClient.invalidateQueries({
                queryKey: ['paymentHistory'],
                exact: false,
                refetchType: activeOnly ? 'active' : 'all',
            });

            await this.queryClient.invalidateQueries({
                queryKey: ['paymentSummary'],
                exact: false,
                refetchType: activeOnly ? 'active' : 'all',
            });
        }

        if (refetch) {
            await this.queryClient.refetchQueries({
                queryKey: carVin ? ['paymentHistory', carVin] : ['paymentHistory'],
                exact: false,
                type: 'active',
            });
        }
    }

    /**
     * Invalidate invoice-related queries
     */
    async invalidateInvoiceQueries(carVin?: string, options: CacheInvalidationOptions = {}) {
        const { refetch = true, activeOnly = true } = options;

        if (carVin) {
            // Invalidate specific car invoice queries
            await this.queryClient.invalidateQueries({
                queryKey: ['invoiceStatus', carVin],
                exact: false,
                refetchType: activeOnly ? 'active' : 'all',
            });
        } else {
            // Invalidate all invoice queries
            await this.queryClient.invalidateQueries({
                queryKey: ['invoiceStatus'],
                exact: false,
                refetchType: activeOnly ? 'active' : 'all',
            });
        }

        if (refetch) {
            await this.queryClient.refetchQueries({
                queryKey: carVin ? ['invoiceStatus', carVin] : ['invoiceStatus'],
                exact: false,
                type: 'active',
            });
        }
    }

    /**
     * Smart invalidation based on car data changes
     */
    async invalidateOnCarChange(change: CarDataChange, options: CacheInvalidationOptions = {}) {
        const { vin, ownerId, changeType } = change;

        // Always invalidate car queries
        await this.invalidateCarQueries(options);

        // Invalidate specific car query
        await this.queryClient.invalidateQueries({
            queryKey: ['getCar', vin],
            exact: false,
            refetchType: options.activeOnly ? 'active' : 'all',
        });

        await this.queryClient.invalidateQueries({
            queryKey: ['getCarPublic', vin],
            exact: false,
            refetchType: options.activeOnly ? 'active' : 'all',
        });

        // Handle specific change types
        switch (changeType) {
            case 'owner_change':
                if (ownerId) {
                    await this.invalidateUserQueries(ownerId, options);
                }
                break;

            case 'payment':
                await this.invalidatePaymentQueries(vin, options);
                break;

            case 'invoice':
                await this.invalidateInvoiceQueries(vin, options);
                break;

            case 'delete':
                // Invalidate all related queries for deleted car
                await this.invalidatePaymentQueries(vin, options);
                await this.invalidateInvoiceQueries(vin, options);
                if (ownerId) {
                    await this.invalidateUserQueries(ownerId, options);
                }
                break;
        }

        // Invalidate custom keys if provided
        if (options.customKeys) {
            for (const key of options.customKeys) {
                await this.queryClient.invalidateQueries({
                    queryKey: key,
                    exact: false,
                    refetchType: options.activeOnly ? 'active' : 'all',
                });
            }
        }
    }

    /**
     * Smart invalidation based on user data changes
     */
    async invalidateOnUserChange(change: UserDataChange, options: CacheInvalidationOptions = {}) {
        const { userId, changeType } = change;

        // Always invalidate user queries
        await this.invalidateUserQueries(userId, options);

        // Handle specific change types
        switch (changeType) {
            case 'car_assignment':
                // When user gets/loses cars, invalidate car queries too
                await this.invalidateCarQueries(options);
                break;

            case 'delete':
                // When user is deleted, invalidate all their related data
                await this.invalidateCarQueries(options);
                break;
        }
    }

    /**
     * Smart invalidation based on payment data changes
     */
    async invalidateOnPaymentChange(change: PaymentDataChange, options: CacheInvalidationOptions = {}) {
        const { carVin, changeType } = change;

        // Always invalidate payment queries
        await this.invalidatePaymentQueries(carVin, options);

        // Payment changes affect car data (due amounts, paid amounts)
        await this.invalidateCarQueries(options);
        await this.queryClient.invalidateQueries({
            queryKey: ['getCar', carVin],
            exact: false,
            refetchType: options.activeOnly ? 'active' : 'all',
        });
    }

    /**
     * Smart invalidation based on invoice data changes
     */
    async invalidateOnInvoiceChange(change: InvoiceDataChange, options: CacheInvalidationOptions = {}) {
        const { carVin, changeType } = change;

        // Always invalidate invoice queries
        await this.invalidateInvoiceQueries(carVin, options);

        // Invoice changes might affect car display (hasInvoice flags)
        await this.invalidateCarQueries(options);
        await this.queryClient.invalidateQueries({
            queryKey: ['getCar', carVin],
            exact: false,
            refetchType: options.activeOnly ? 'active' : 'all',
        });
    }

    /**
     * Comprehensive invalidation for complex operations
     */
    async invalidateAll(options: CacheInvalidationOptions = {}) {
        await Promise.all([
            this.invalidateCarQueries(options),
            this.invalidateUserQueries(undefined, options),
            this.invalidatePaymentQueries(undefined, options),
            this.invalidateInvoiceQueries(undefined, options),
        ]);
    }

    /**
     * Batch invalidation for multiple changes
     */
    async batchInvalidate(
        changes: Array<CarDataChange | UserDataChange | PaymentDataChange | InvoiceDataChange>,
        options: CacheInvalidationOptions = {}
    ) {
        const invalidationPromises = changes.map(change => {
            if ('vin' in change) {
                return this.invalidateOnCarChange(change as CarDataChange, options);
            } else if ('userId' in change) {
                return this.invalidateOnUserChange(change as UserDataChange, options);
            } else if ('carVin' in change && 'paymentType' in change) {
                return this.invalidateOnPaymentChange(change as PaymentDataChange, options);
            } else if ('carVin' in change && 'invoiceType' in change) {
                return this.invalidateOnInvoiceChange(change as InvoiceDataChange, options);
            }
            return Promise.resolve();
        });

        await Promise.all(invalidationPromises);
    }
}

/**
 * Hook to use the cache invalidation service
 */
export function useCacheInvalidation() {
    const queryClient = useQueryClient();
    const service = new CacheInvalidationService(queryClient);

    return {
        // Car-related invalidations
        invalidateCarQueries: (options?: CacheInvalidationOptions) =>
            service.invalidateCarQueries(options),
        invalidateOnCarChange: (change: CarDataChange, options?: CacheInvalidationOptions) =>
            service.invalidateOnCarChange(change, options),

        // User-related invalidations
        invalidateUserQueries: (userId?: string, options?: CacheInvalidationOptions) =>
            service.invalidateUserQueries(userId, options),
        invalidateOnUserChange: (change: UserDataChange, options?: CacheInvalidationOptions) =>
            service.invalidateOnUserChange(change, options),

        // Payment-related invalidations
        invalidatePaymentQueries: (carVin?: string, options?: CacheInvalidationOptions) =>
            service.invalidatePaymentQueries(carVin, options),
        invalidateOnPaymentChange: (change: PaymentDataChange, options?: CacheInvalidationOptions) =>
            service.invalidateOnPaymentChange(change, options),

        // Invoice-related invalidations
        invalidateInvoiceQueries: (carVin?: string, options?: CacheInvalidationOptions) =>
            service.invalidateInvoiceQueries(carVin, options),
        invalidateOnInvoiceChange: (change: InvoiceDataChange, options?: CacheInvalidationOptions) =>
            service.invalidateOnInvoiceChange(change, options),

        // Comprehensive invalidations
        invalidateAll: (options?: CacheInvalidationOptions) =>
            service.invalidateAll(options),
        batchInvalidate: (
            changes: Array<CarDataChange | UserDataChange | PaymentDataChange | InvoiceDataChange>,
            options?: CacheInvalidationOptions
        ) => service.batchInvalidate(changes, options),
    };
}
