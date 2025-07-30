"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { getUsersAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
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

export const Client = ({ translations }: ClientProps) => {
  // Table state - must be called before any early returns
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Optimized React Query configuration to prevent excessive calls
  const { isLoading, data = [], error } = useServerActionQuery(getUsersAction, {
    input: undefined,
    queryKey: ["getUsers"],
    // Add React Query optimization options
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Validate translations prop after hooks
  if (!translations || typeof translations !== 'object') {
    return (
      <div className="container mx-auto py-10 text-primary">
        <p>Configuration error</p>
      </div>
    );
  }

  // Safe data validation
  const safeData = Array.isArray(data) ? data : [];

  // Client-side filtering with safe data
  let filteredData = safeData;
  filters.forEach(f => {
    if (f.value && safeData.length > 0 && Object.prototype.hasOwnProperty.call(safeData[0], f.id)) {
      filteredData = filteredData.filter((row: Record<string, any>) => String(row[f.id as keyof typeof row] ?? '').toLowerCase().includes(String(f.value).toLowerCase()));
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

  // Client-side pagination
  const rowCount = filteredData.length;
  const paginatedData = filteredData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

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

  const LoadingState = () => (
    <div className="w-full h-[400px] flex justify-center items-center">
      <Loader2 className="animate-spin text-center" />
    </div>
  );

  const ErrorState = () => (
    <div className="w-full h-[400px] flex justify-center items-center">
      <p>{translations.error}</p>
      <p>{error?.message}</p>
    </div>
  );

  return (
    <div className="container mx-auto py-10 text-primary">
      <h1 className="text-3xl font-bold pb-8 leading-tight">{translations.title}</h1>
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
        <div className="leading-relaxed">{translations.noUsers}</div>
      )}
    </div>
  );
};
