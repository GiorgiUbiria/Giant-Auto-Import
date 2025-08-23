"use client";

import { DataTable } from "@/components/data-table";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";

interface ClientProps {
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
      totalPurchaseFee: string;
      basePurchaseFee: string;
      auctionFee: string;
      gateFee: string;
      titleFee: string;
      environmentalFee: string;
      virtualBidFee: string;
      totalPurchaseFeeResult: string;
      shippingFee: string;
      groundFee: string;
      oceanFee: string;
    };
    buttons: {
      comingSoon: string;
    };
    status: {
      yes: string;
      no: string;
    };
    dataTable: {
      searchPlaceholder: string;
      columns: string;
      noResults: string;
      noData: string;
      clearFilter: string;
    };
    pagination: {
      showing: string;
      rowsPerPage: string;
      page: string;
      goToFirst: string;
      goToPrevious: string;
      goToNext: string;
      goToLast: string;
    };
  };
}

// Add type for API response
interface CarsApiResponse {
  cars: any[];
  count: number;
}

const fetchCars = async ({ pageIndex, pageSize, sorting, filters }: {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  filters: ColumnFiltersState;
}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Reduced timeout to 15 seconds

    const params = new URLSearchParams();
    params.set("page", (pageIndex + 1).toString());
    params.set("pageSize", pageSize.toString());
    if (sorting.length > 0) {
      params.set("sortBy", sorting[0].id);
      params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
    }
    filters.forEach(f => {
      if (f.value) params.set(f.id, f.value as string);
    });

    const response = await fetch(`/api/cars?${params.toString()}`, {
      signal: controller.signal,
      // Add cache control to prevent caching issues
      cache: 'no-store'
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

export const Client = ({ translations }: ClientProps) => {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const { isLoading, data, error } = useQuery<CarsApiResponse>({
    queryKey: ["getCars", pageIndex, pageSize, sorting, filters],
    queryFn: () => fetchCars({ pageIndex, pageSize, sorting, filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes - reduced for better real-time updates
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 1, // Reduce retries
    refetchOnWindowFocus: false, // Prevent refetch on focus
    refetchOnMount: true, // Ensure fresh data on mount
    refetchOnReconnect: true, // Refetch on reconnect
  });

  // Provide default values
  const tableData = data?.cars || [];
  const totalCount = data?.count || 0;

  const handlePaginationChange = React.useCallback(({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
    setPageIndex(pageIndex);
    setPageSize(pageSize);
  }, []);

  const handleSortingChange = React.useCallback((updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    setSorting(typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue);
  }, [sorting]);

  const handleFiltersChange = React.useCallback((updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
    setFilters(typeof updaterOrValue === "function" ? updaterOrValue(filters) : updaterOrValue);
  }, [filters]);

  const handleColumnVisibilityChange = React.useCallback((updaterOrValue: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
    setColumnVisibility(typeof updaterOrValue === "function" ? updaterOrValue(columnVisibility) : updaterOrValue);
  }, [columnVisibility]);

  const handleRowSelectionChange = React.useCallback((updaterOrValue: any | ((old: any) => any)) => {
    setRowSelection(typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue);
  }, [rowSelection]);

  const LoadingState = () => (
    <div className="w-full h-[400px] flex justify-center items-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{translations.loading}</p>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="w-full h-[400px] flex justify-center items-center">
      <div className="text-center">
        <p className="text-destructive font-medium">{translations.error}</p>
        <p className="text-muted-foreground text-sm mt-1">{error?.message}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div className="w-full px-4 md:px-6">
      <h1 className="text-3xl font-bold pb-8 leading-tight">{translations.title}</h1>
      <DataTable
        columns={columns(translations)}
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
          ...translations.dataTable,
          pagination: translations.pagination
        }}
      />
    </div>
  );
};
