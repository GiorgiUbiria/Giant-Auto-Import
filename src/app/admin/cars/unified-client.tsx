"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useUnifiedQuery, useCarState } from "@/lib/services/unified-state-service";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";
import { selectCarSchema } from "@/lib/drizzle/schema";
import { z } from "zod";
import { FullPageLoading, TableLoadingBoundary } from "@/components/ui/loading-boundaries";
import { useCacheInvalidation } from "@/lib/services/cache-invalidation-service";

// Types
type Car = z.infer<typeof selectCarSchema>;

interface CarsApiResponse {
    cars: Car[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
}

interface UnifiedClientProps {
    translations: {
        title: string;
        loading: string;
        error: string;
        noCars: string;
        columns: {
            owner: string;
            purchaseDate: string;
            photo: string;
            vehicle: string;
            lotVin: string;
            receiver: string;
            fuel: string;
            title: string;
            keys: string;
            usPort: string;
            destinationPort: string;
            actions: string;
        };
        actions: {
            edit: string;
            delete: string;
            deleteConfirmDescription: string;
            cancel: string;
            deleteAction: string;
            deleting: string;
            deleteSuccess: string;
            deleteError: string;
        };
        receiver: {
            noReceiver: string;
            assignSuccess: string;
            assignError: string;
        };
        owner: {
            loadError: string;
        };
        totalFee: {
            title: string;
            purchaseFee: string;
            auctionFee: string;
            gateFee: string;
            shippingFee: string;
            total: string;
        };
    };
}

// API function
const fetchCars = async ({
    pageIndex,
    pageSize,
    sorting,
    filters,
}: {
    pageIndex: number;
    pageSize: number;
    sorting: SortingState;
    filters: ColumnFiltersState;
}): Promise<CarsApiResponse> => {
    const params = new URLSearchParams({
        page: pageIndex.toString(),
        pageSize: pageSize.toString(),
    });

    // Add sorting parameters
    if (sorting.length > 0) {
        const sort = sorting[0];
        params.append('sortBy', sort.id);
        params.append('sortOrder', sort.desc ? 'desc' : 'asc');
    }

    // Add filter parameters
    filters.forEach(filter => {
        if (filter.value) {
            params.append(filter.id, filter.value.toString());
        }
    });

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`/api/cars?${params.toString()}`, {
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.details || 'Failed to fetch cars');
        }
        return response.json();
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timed out after 15 seconds');
        }
        throw error;
    }
};

export const UnifiedClient = ({ translations }: UnifiedClientProps) => {
    // Local state for table controls
    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(20);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [filters, setFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    // Unified state management
    const { cars, loading, error, setLoading, setError, setData } = useCarState();

    // React Query for data fetching
    const { isLoading, data, error: queryError, refetch } = useQuery<CarsApiResponse>({
        queryKey: ["getCars", pageIndex, pageSize, sorting, filters],
        queryFn: () => fetchCars({ pageIndex, pageSize, sorting, filters }),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 20 * 60 * 1000, // 20 minutes cache
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
    });

    // Unified query integration
    useUnifiedQuery(
        'admin_cars',
        ["getCars", pageIndex, pageSize, sorting, filters],
        data,
        isLoading,
        queryError
    );

    // Cache invalidation
    const { invalidateCarQueries } = useCacheInvalidation();

    // Manual refresh function
    const handleManualRefresh = React.useCallback(() => {
        refetch();
        invalidateCarQueries({ refetch: true, activeOnly: true });
    }, [refetch, invalidateCarQueries]);

    // Provide default values
    const tableData = data?.cars || [];
    const totalCount = data?.totalCount || 0;

    // Pagination handlers
    const handlePaginationChange = React.useCallback((updaterOrValue: any) => {
        if (typeof updaterOrValue === 'function') {
            const newState = updaterOrValue({ pageIndex, pageSize });
            setPageIndex(newState.pageIndex);
            setPageSize(newState.pageSize);
        } else {
            setPageIndex(updaterOrValue.pageIndex);
            setPageSize(updaterOrValue.pageSize);
        }
    }, [pageIndex, pageSize]);

    // Sorting handlers
    const handleSortingChange = React.useCallback((updaterOrValue: any) => {
        if (typeof updaterOrValue === 'function') {
            setSorting(updaterOrValue);
        } else {
            setSorting(updaterOrValue);
        }
    }, []);

    // Filter handlers
    const handleFiltersChange = React.useCallback((updaterOrValue: any) => {
        if (typeof updaterOrValue === 'function') {
            setFilters(updaterOrValue);
        } else {
            setFilters(updaterOrValue);
        }
    }, []);

    // Column visibility handlers
    const handleColumnVisibilityChange = React.useCallback((updaterOrValue: any) => {
        if (typeof updaterOrValue === 'function') {
            setColumnVisibility(updaterOrValue);
        } else {
            setColumnVisibility(updaterOrValue);
        }
    }, []);

    // Row selection handlers
    const handleRowSelectionChange = React.useCallback((updaterOrValue: any) => {
        if (typeof updaterOrValue === 'function') {
            setRowSelection(updaterOrValue);
        } else {
            setRowSelection(updaterOrValue);
        }
    }, []);

    // Loading state
    if (isLoading && !data) {
        return (
            <TableLoadingBoundary
                message="Loading cars..."
                errorMessage="Failed to load cars data"
            >
                <FullPageLoading message="Loading cars..." variant="detailed" />
            </TableLoadingBoundary>
        );
    }

    // Error state
    if (queryError && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-6">
                <div className="text-center space-y-4">
                    <div className="text-destructive">
                        <h3 className="text-lg font-semibold">Error Loading Cars</h3>
                        <p className="text-sm text-muted-foreground">
                            {queryError.message || translations.error}
                        </p>
                    </div>
                    <button
                        onClick={handleManualRefresh}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{translations.title}</h1>
                    <p className="text-muted-foreground">
                        {totalCount} car{totalCount !== 1 ? 's' : ''} found
                    </p>
                </div>
                <button
                    onClick={handleManualRefresh}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    disabled={isLoading}
                >
                    {isLoading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <TableLoadingBoundary
                message="Loading table data..."
                errorMessage="Failed to load table data"
            >
                <DataTable
                    columns={columns}
                    data={tableData}
                    filterKey="vinDetails"
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    onPaginationChange={handlePaginationChange}
                    sorting={sorting}
                    onSortingChange={handleSortingChange}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    rowCount={totalCount}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={handleColumnVisibilityChange}
                    rowSelection={rowSelection}
                    onRowSelectionChange={handleRowSelectionChange}
                    translations={{
                        searchPlaceholder: "Search by VIN or Lot Number...",
                        columns: "Columns",
                        noResults: "No results found",
                        noData: translations.noCars,
                        clearFilter: "Clear filters",
                        pagination: {
                            showing: "Showing",
                            of: "of",
                            results: "results",
                            page: "Page",
                            goToPage: "Go to page",
                            previous: "Previous",
                            next: "Next",
                        },
                    }}
                />
            </TableLoadingBoundary>
        </div>
    );
};
