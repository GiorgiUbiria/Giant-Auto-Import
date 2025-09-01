"use client";

import { useAtomValue, useAtom } from 'jotai';
import { DataTable } from '@/components/data-table';
import { columns } from '../columns';
import { adminUserDataAtom, adminUserCarsAtom, adminUserTableStateAtom, triggerAdminUserRefetchAtom } from '@/lib/admin-user-atoms';
import { setAdminUserTablePageAtom, setAdminUserTableSortingAtom, setAdminUserTableFiltersAtom, setAdminUserTableColumnVisibilityAtom, setAdminUserTableRowSelectionAtom } from '@/lib/admin-user-atoms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';
import { SortingState, ColumnFiltersState, VisibilityState } from '@tanstack/react-table';

export function UserCarsTab() {
  const user = useAtomValue(adminUserDataAtom);
  const cars = useAtomValue(adminUserCarsAtom);
  const tableState = useAtomValue(adminUserTableStateAtom);

  const [, setPage] = useAtom(setAdminUserTablePageAtom);
  const [, setSorting] = useAtom(setAdminUserTableSortingAtom);
  const [, setFilters] = useAtom(setAdminUserTableFiltersAtom);
  const [, setColumnVisibility] = useAtom(setAdminUserTableColumnVisibilityAtom);
  const [, setRowSelection] = useAtom(setAdminUserTableRowSelectionAtom);
  const [, triggerRefetch] = useAtom(triggerAdminUserRefetchAtom);

  // Refresh function to reload data after payments
  const handleRefresh = () => {
    // Trigger a refetch of the cars data
    triggerRefetch();
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        User data not available
      </div>
    );
  }

  // Client-side filtering
  let filteredData = cars;
  tableState.filters.forEach(f => {
    if (f.value && filteredData.length > 0 && Object.prototype.hasOwnProperty.call(filteredData[0], f.id)) {
      filteredData = filteredData.filter((row: Record<string, any>) =>
        String(row[f.id as keyof typeof row] ?? '').toLowerCase().includes(String(f.value).toLowerCase())
      );
    }
  });

  // Client-side sorting
  if (tableState.sorting.length > 0) {
    const { id, desc } = tableState.sorting[0];
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
  const paginatedData = filteredData.slice(
    tableState.pageIndex * tableState.pageSize,
    (tableState.pageIndex + 1) * tableState.pageSize
  );

  // Handlers
  const handlePaginationChange = ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
    setPage(pageIndex, pageSize);
  };

  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updaterOrValue === "function" ? updaterOrValue(tableState.sorting) : updaterOrValue;
    setSorting(newSorting);
  };

  const handleFiltersChange = (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
    const newFilters = typeof updaterOrValue === "function" ? updaterOrValue(tableState.filters) : updaterOrValue;
    setFilters(newFilters);
  };

  const handleColumnVisibilityChange = (updaterOrValue: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
    const newVisibility = typeof updaterOrValue === "function" ? updaterOrValue(tableState.columnVisibility) : updaterOrValue;
    setColumnVisibility(newVisibility);
  };

  const handleRowSelectionChange = (updaterOrValue: any | ((old: any) => any)) => {
    const newSelection = typeof updaterOrValue === "function" ? updaterOrValue(tableState.rowSelection) : updaterOrValue;
    setRowSelection(newSelection);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User&apos;s Cars</h2>
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {cars.length} car{cars.length !== 1 ? 's' : ''} total
          </span>
        </div>
      </div>

      {cars.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              No Cars Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              This user doesn&apos;t have any cars in the system yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns(handleRefresh)}
              data={paginatedData}
              filterKey="vin"
              pageIndex={tableState.pageIndex}
              pageSize={tableState.pageSize}
              onPaginationChange={handlePaginationChange}
              sorting={tableState.sorting}
              onSortingChange={handleSortingChange}
              filters={tableState.filters}
              onFiltersChange={handleFiltersChange}
              rowCount={rowCount}
              columnVisibility={tableState.columnVisibility}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              rowSelection={tableState.rowSelection}
              onRowSelectionChange={handleRowSelectionChange}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
