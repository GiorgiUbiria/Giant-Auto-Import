/**
 * Cache Invalidation Service - Usage Examples
 * 
 * This file demonstrates how to use the centralized cache invalidation service
 * in different scenarios throughout the application.
 */

import { useCacheInvalidation } from './cache-invalidation-service';

// ============================================================================
// EXAMPLE 1: Car Data Changes
// ============================================================================

export function CarUpdateExample() {
    const { invalidateOnCarChange } = useCacheInvalidation();

    const handleCarUpdate = async (carData: any) => {
        // When updating car data, use smart invalidation
        await invalidateOnCarChange({
            vin: carData.vin,
            ownerId: carData.ownerId,
            changeType: 'update'
        }, {
            refetch: true,        // Immediately refetch data
            activeOnly: true      // Only refetch active queries
        });
    };

    const handleOwnerChange = async (vin: string, newOwnerId: string | null) => {
        // When changing car ownership, this will invalidate:
        // - Car queries (all views)
        // - User queries (both old and new owner)
        // - Related data
        await invalidateOnCarChange({
            vin: vin,
            ownerId: newOwnerId,
            changeType: 'owner_change'
        }, { refetch: true, activeOnly: true });
    };

    const handleCarDelete = async (vin: string, ownerId: string | null) => {
        // When deleting a car, invalidate all related data
        await invalidateOnCarChange({
            vin: vin,
            ownerId: ownerId,
            changeType: 'delete'
        }, { refetch: true, activeOnly: true });
    };
}

// ============================================================================
// EXAMPLE 2: Payment Changes
// ============================================================================

export function PaymentUpdateExample() {
    const { invalidateOnPaymentChange } = useCacheInvalidation();

    const handlePaymentAdded = async (carVin: string, paymentType: 'PURCHASE' | 'SHIPPING') => {
        // When adding a payment, this will invalidate:
        // - Payment history queries
        // - Car queries (due amounts, paid amounts)
        // - Related views
        await invalidateOnPaymentChange({
            carVin: carVin,
            paymentType: paymentType,
            changeType: 'create'
        }, { refetch: true, activeOnly: true });
    };

    const handlePaymentDeleted = async (carVin: string) => {
        // When deleting payments
        await invalidateOnPaymentChange({
            carVin: carVin,
            changeType: 'delete'
        }, { refetch: true, activeOnly: true });
    };
}

// ============================================================================
// EXAMPLE 3: Invoice Changes
// ============================================================================

export function InvoiceUpdateExample() {
    const { invalidateOnInvoiceChange } = useCacheInvalidation();

    const handleInvoiceUpload = async (carVin: string, invoiceType: 'PURCHASE' | 'SHIPPING' | 'TOTAL') => {
        // When uploading an invoice, this will invalidate:
        // - Invoice status queries
        // - Car queries (hasInvoice flags)
        // - Related views
        await invalidateOnInvoiceChange({
            carVin: carVin,
            invoiceType: invoiceType,
            changeType: 'create'
        }, { refetch: true, activeOnly: true });
    };

    const handleInvoiceDelete = async (carVin: string, invoiceType: 'PURCHASE' | 'SHIPPING' | 'TOTAL') => {
        // When deleting invoices
        await invalidateOnInvoiceChange({
            carVin: carVin,
            invoiceType: invoiceType,
            changeType: 'delete'
        }, { refetch: true, activeOnly: true });
    };
}

// ============================================================================
// EXAMPLE 4: User Data Changes
// ============================================================================

export function UserUpdateExample() {
    const { invalidateOnUserChange } = useCacheInvalidation();

    const handleUserUpdate = async (userId: string) => {
        // When updating user data
        await invalidateOnUserChange({
            userId: userId,
            changeType: 'update'
        }, { refetch: true, activeOnly: true });
    };

    const handleCarAssignment = async (userId: string) => {
        // When assigning/unassigning cars to/from user
        // This will invalidate both user and car queries
        await invalidateOnUserChange({
            userId: userId,
            changeType: 'car_assignment'
        }, { refetch: true, activeOnly: true });
    };
}

// ============================================================================
// EXAMPLE 5: Batch Operations
// ============================================================================

export function BatchOperationsExample() {
    const { batchInvalidate } = useCacheInvalidation();

    const handleBulkCarUpdate = async (carUpdates: Array<{ vin: string, ownerId: string | null }>) => {
        // When performing bulk operations, use batch invalidation
        const changes = carUpdates.map(car => ({
            vin: car.vin,
            ownerId: car.ownerId,
            changeType: 'update' as const
        }));

        await batchInvalidate(changes, {
            refetch: true,
            activeOnly: true
        });
    };

    const handleComplexOperation = async () => {
        // When multiple types of changes happen together
        const changes = [
            // Car changes
            { vin: 'ABC123', ownerId: 'user1', changeType: 'update' as const },
            { vin: 'DEF456', ownerId: null, changeType: 'delete' as const },

            // Payment changes
            { carVin: 'ABC123', paymentType: 'PURCHASE' as const, changeType: 'create' as const },

            // Invoice changes
            { carVin: 'ABC123', invoiceType: 'PURCHASE' as const, changeType: 'create' as const },

            // User changes
            { userId: 'user1', changeType: 'car_assignment' as const }
        ];

        await batchInvalidate(changes, { refetch: true, activeOnly: true });
    };
}

// ============================================================================
// EXAMPLE 6: Custom Invalidation
// ============================================================================

export function CustomInvalidationExample() {
    const { invalidateOnCarChange } = useCacheInvalidation();

    const handleCustomOperation = async (carVin: string) => {
        // When you need to invalidate custom query keys
        await invalidateOnCarChange({
            vin: carVin,
            changeType: 'update'
        }, {
            refetch: true,
            activeOnly: true,
            customKeys: [
                ['customQuery1', carVin],
                ['customQuery2', 'someParam'],
                ['anotherQuery']
            ]
        });
    };
}

// ============================================================================
// EXAMPLE 7: Performance Optimization
// ============================================================================

export function PerformanceOptimizedExample() {
    const { invalidateOnCarChange } = useCacheInvalidation();

    const handleOptimizedUpdate = async (carVin: string) => {
        // For better performance, you can:
        // 1. Skip immediate refetch (let React Query handle it)
        await invalidateOnCarChange({
            vin: carVin,
            changeType: 'update'
        }, {
            refetch: false,      // Don't immediately refetch
            activeOnly: true     // Only invalidate active queries
        });

        // 2. Or invalidate all queries (including inactive ones)
        await invalidateOnCarChange({
            vin: carVin,
            changeType: 'update'
        }, {
            refetch: true,
            activeOnly: false    // Invalidate all queries, not just active ones
        });
    };
}

// ============================================================================
// MIGRATION GUIDE
// ============================================================================

/**
 * MIGRATION FROM OLD CACHE INVALIDATION:
 * 
 * OLD WAY:
 * ```typescript
 * const { invalidateAllCarsQueries } = useCarsCacheInvalidation();
 * await invalidateAllCarsQueries();
 * ```
 * 
 * NEW WAY:
 * ```typescript
 * const { invalidateOnCarChange } = useCacheInvalidation();
 * await invalidateOnCarChange({
 *   vin: carVin,
 *   ownerId: ownerId,
 *   changeType: 'update'
 * }, { refetch: true, activeOnly: true });
 * ```
 * 
 * BENEFITS:
 * - More precise invalidation
 * - Better performance
 * - Consistent patterns
 * - Type safety
 * - Smart relationship handling
 */
