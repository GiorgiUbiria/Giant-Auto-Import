import { useCacheInvalidation } from '@/lib/services/cache-invalidation-service';

/**
 * Legacy hook for backward compatibility
 * @deprecated Use useCacheInvalidation() directly for better control
 */
export function useCarsCacheInvalidation() {
  const { invalidateCarQueries } = useCacheInvalidation();

  const invalidateAllCarsQueries = async () => {
    await invalidateCarQueries({ refetch: true, activeOnly: true });
  };

  return { invalidateAllCarsQueries };
}
