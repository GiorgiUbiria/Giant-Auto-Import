"use client";

import { DataTable } from "@/components/data-table";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";

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
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || 'Failed to fetch cars');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds');
    }
    throw error;
  }
};

// Utility to handle both value and updater function
function handleControlledChange<T>(setState: React.Dispatch<React.SetStateAction<T>>) {
  return (updaterOrValue: T | ((old: T) => T)) => {
    setState((old) =>
      typeof updaterOrValue === "function"
        ? (updaterOrValue as (old: T) => T)(old)
        : updaterOrValue
    );
  };
}

export const Client = () => {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const { isLoading, data = { cars: [], count: 0 }, error } = useQuery<CarsApiResponse>({
    queryKey: ["getCars", pageIndex, pageSize, sorting, filters],
    queryFn: () => fetchCars({ pageIndex, pageSize, sorting, filters }),
    // Remove keepPreviousData if not supported by your React Query version
  });

  const handlePaginationChange = ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
    setPageIndex(pageIndex);
    setPageSize(pageSize);
  };

  const handleSortingChange = handleControlledChange<SortingState>(setSorting);
  const handleFiltersChange = handleControlledChange<ColumnFiltersState>(setFilters);
  const handleColumnVisibilityChange = handleControlledChange<VisibilityState>(setColumnVisibility);
  const handleRowSelectionChange = handleControlledChange<any>(setRowSelection);

  const LoadingState = () => (
    <div className="w-full h-[400px] flex justify-center items-center">
      <Loader2 className="animate-spin text-center" />
    </div>
  );

  const ErrorState = () => (
    <div className="w-full h-[400px] flex justify-center items-center">
      <p>Error loading car data. Please try again later.</p>
      <p>{error?.message}</p>
    </div>
  );

  return (
    <div className="py-10 text-primary">
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : data && data.cars && data.cars.length > 0 ? (
        <DataTable
          columns={columns}
          data={data.cars}
          filterKey="vin"
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          rowCount={data.count}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
        />
      ) : (
        <p>No cars found.</p>
      )}
    </div>
  );
};
