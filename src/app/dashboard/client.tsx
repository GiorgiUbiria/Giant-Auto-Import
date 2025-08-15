"use client";

import { DataTable } from "@/components/data-table";
import { Loader2, AlertCircle } from "lucide-react";
import { columns } from "./columns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CustomerNotes } from "@/components/customer-notes";
import { PaymentHistory } from "@/components/payment-history";

// Add type for API response
interface CarsApiResponse {
  cars: any[];
  count: number;
}

const fetchUserCars = async ({ 
  userId, 
  pageIndex, 
  pageSize, 
  sorting, 
  filters 
}: {
  userId: string;
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
    params.set("ownerId", userId); // Filter by user ID
    
    if (sorting.length > 0) {
      params.set("sortBy", sorting[0].id);
      params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
    }
    
    filters.forEach(f => {
      if (f.value) {
        // Map filter IDs to API parameters
        if (f.id === "vinDetails") {
          params.set("vin", f.value as string);
        } else {
          params.set(f.id, f.value as string);
        }
      }
    });

    const response = await fetch(`/api/cars?${params.toString()}`, {
      signal: controller.signal,
      cache: 'default'
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

const LoadingState = () => (
  <div className="w-full h-[50vh] grid place-items-center">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading your cars...</p>
    </div>
  </div>
);

const ErrorState = ({ refetch }: { refetch: () => void }) => (
  <div className="py-10 px-4 max-w-2xl mx-auto">
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>Failed to load your cars. Please try again.</p>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="w-fit"
        >
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  </div>
);

export const Client = ({ userId }: { userId: string }) => {
  // Add state for table controls
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Fetch user data for balance
  const { data: userData } = useQuery({
    queryKey: ["getUser", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

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

  const { isLoading, data, error, refetch } = useQuery<CarsApiResponse>({
    queryKey: ["getUserCars", userId, pageIndex, pageSize, sorting, filters],
    queryFn: () => fetchUserCars({ userId, pageIndex, pageSize, sorting, filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes - increased for better caching
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 1, // Reduce retries
    refetchOnWindowFocus: false, // Prevent refetch on focus
  });

  // Provide default values
  const tableData = data?.cars || [];
  const totalCount = data?.count || 0;

  if (error) {
    return <ErrorState refetch={refetch} />;
  }

  if (isLoading) {
    return (
      <Suspense fallback={<LoadingState />}>
        <LoadingState />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <div className="w-full px-4 md:px-6 space-y-6">
        {/* Payment History Section */}
        <div className="max-w-4xl">
          <PaymentHistory 
            userId={userId} 
            balance={userData?.user?.balance || 0} 
          />
        </div>
        
        {/* Customer Notes Section */}
        <div className="max-w-4xl">
          <CustomerNotes userId={userId} />
        </div>
        
        {/* Cars Data Table */}
        <div>
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
          />
        </div>
      </div>
    </Suspense>
  );
};
