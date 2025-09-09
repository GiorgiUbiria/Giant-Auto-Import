"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { useQuery } from "@tanstack/react-query";
import { SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";

interface ClientProps {
  translations: {
    title: string;
    loading: string;
    error: string;
    noUsers: string;
    columns: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
      role: string;
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

export const Client = React.memo(({ translations }: ClientProps) => {
  // Table state - must be called before any early returns
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Fetch users from API route
  const fetchUsers = async () => {
    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.users || [];
  };

  // React Query for API calls
  const { isLoading, data = [], error, isFetching } = useQuery({
    queryKey: ["getUsers"],
    queryFn: fetchUsers,
    // Optimized caching for better performance
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when reconnecting
    refetchInterval: false, // Disable automatic refetching
  });

  // Memoized data processing for better performance
  const processedData = React.useMemo(() => {
    // Safe data validation
    const safeData = Array.isArray(data) ? data : [];

    // Client-side filtering with safe data
    let filteredData = safeData;
    filters.forEach(f => {
      if (f.value && safeData.length > 0 && Object.prototype.hasOwnProperty.call(safeData[0], f.id)) {
        filteredData = filteredData.filter((row: Record<string, any>) =>
          String(row[f.id as keyof typeof row] ?? '').toLowerCase().includes(String(f.value).toLowerCase())
        );
      }
    });

    // Client-side sorting with safe data
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      filteredData = [...filteredData].sort((a: Record<string, any>, b: Record<string, any>) => {
        const aValue = a[id as keyof typeof a];
        const bValue = b[id as keyof typeof b];
        if (aValue < bValue) return desc ? 1 : -1;
        if (aValue > bValue) return desc ? -1 : 1;
        return 0;
      });
    }

    return filteredData;
  }, [data, filters, sorting]);

  // Memoized pagination
  const paginationData = React.useMemo(() => {
    const rowCount = processedData.length;
    const paginatedData = processedData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    return { rowCount, paginatedData };
  }, [processedData, pageIndex, pageSize]);

  const { rowCount, paginatedData } = paginationData;

  // Handlers
  const handlePaginationChange = ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
    setPageIndex(pageIndex);
    setPageSize(pageSize);
  };
  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    setSorting(typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue);
  };
  const handleFiltersChange = (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
    setFilters(typeof updaterOrValue === "function" ? updaterOrValue(filters) : updaterOrValue);
  };
  const handleColumnVisibilityChange = (updaterOrValue: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
    setColumnVisibility(typeof updaterOrValue === "function" ? updaterOrValue(columnVisibility) : updaterOrValue);
  };
  const handleRowSelectionChange = (updaterOrValue: any | ((old: any) => any)) => {
    setRowSelection(typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue);
  };

  // Validate translations prop after all hooks are called
  if (!translations || typeof translations !== 'object') {
    return (
      <div className="container mx-auto py-10 text-primary">
        <p>Configuration error</p>
      </div>
    );
  }

  const LoadingState = () => (
    <div className="space-y-4">
      {/* Table header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
      </div>
      {/* Table rows skeleton */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>
      ))}
    </div>
  );

  const ErrorState = () => (
    <div className="w-full h-[400px] flex justify-center items-center">
      <p>{translations.error}</p>
      <p>{error?.message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto py-10 px-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-3xl font-bold pb-8 leading-tight text-gray-900 dark:text-gray-100">{translations.title}</h1>
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : rowCount > 0 ? (
            <DataTable
              columns={columns({
                ...translations.columns,
                actionsTranslations: translations.actions
              })}
              data={paginatedData}
              filterKey="fullName"
              pageIndex={pageIndex}
              pageSize={pageSize}
              onPaginationChange={handlePaginationChange}
              sorting={sorting}
              onSortingChange={handleSortingChange}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              rowCount={rowCount}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              rowSelection={rowSelection}
              onRowSelectionChange={handleRowSelectionChange}
              translations={{
                ...translations.dataTable,
                pagination: translations.pagination
              }}
            />
          ) : (
            <div className="leading-relaxed text-gray-700 dark:text-gray-300">{translations.noUsers}</div>
          )}
        </div>
      </div>
    </div>
  );
});

Client.displayName = 'AdminUsersClient';
