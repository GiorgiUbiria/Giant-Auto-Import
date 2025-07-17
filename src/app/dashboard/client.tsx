"use client";

import { DataTable } from "@/components/data-table";
import { getCarsForUserAction } from "@/lib/actions/carActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { AlertCircle, Loader2 } from "lucide-react";
import { columns } from "./columns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";
import React from "react";

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

const EmptyState = () => (
      <div className="py-10 px-4 max-w-2xl mx-auto">
        <Alert>
          <AlertTitle>No cars found</AlertTitle>
          <AlertDescription>
            You haven&apos;t added any cars yet. Start by adding your first car.
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

  const handlePaginationChange = ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
    setPageIndex(pageIndex);
    setPageSize(pageSize);
  };
  const handleSortingChange = handleControlledChange<SortingState>(setSorting);
  const handleFiltersChange = handleControlledChange<ColumnFiltersState>(setFilters);
  const handleColumnVisibilityChange = handleControlledChange<VisibilityState>(setColumnVisibility);
  const handleRowSelectionChange = handleControlledChange<any>(setRowSelection);

  const { isLoading, data, error, refetch } = useServerActionQuery(getCarsForUserAction, {
    input: {
      id: userId,
    },
    queryKey: ["getCarsForUser", userId],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (error) {
    return <ErrorState refetch={refetch} />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      {isLoading ? (
        <LoadingState />
      ) : !data?.length ? (
        <EmptyState />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          filterKey="vin"
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          rowCount={data.length}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
        />
      )}
    </Suspense>
  );
};
