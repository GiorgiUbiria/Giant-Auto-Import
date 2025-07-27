"use client";

import * as React from "react";

// Selective imports for better tree shaking
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type Table,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "./data-table-pagination";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Settings2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey?: string;
  pageIndex: number;
  pageSize: number;
  onPaginationChange: (updater: { pageIndex: number; pageSize: number }) => void;
  sorting: SortingState;
  onSortingChange: (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => void;
  filters: ColumnFiltersState;
  onFiltersChange: (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
  rowCount: number;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (updaterOrValue: VisibilityState | ((old: VisibilityState) => VisibilityState)) => void;
  rowSelection?: {};
  onRowSelectionChange?: (updaterOrValue: any | ((old: any) => any)) => void;
  translations?: {
    searchPlaceholder: string;
    columns: string;
    noResults: string;
    noData: string;
    clearFilter: string;
    pagination?: {
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

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  pageIndex,
  pageSize,
  onPaginationChange,
  sorting,
  onSortingChange,
  filters,
  onFiltersChange,
  rowCount,
  columnVisibility = {},
  onColumnVisibilityChange,
  rowSelection = {},
  onRowSelectionChange,
  translations,
}: DataTableProps<TData, TValue>) {

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(rowCount / pageSize),
    state: {
      sorting,
      columnFilters: filters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange,
    onColumnFiltersChange: onFiltersChange,
    onColumnVisibilityChange,
    onRowSelectionChange,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        onPaginationChange(newState);
      } else {
        onPaginationChange(updater);
      }
    },
  });

  return (
    <div className="w-full min-w-full">
      <Card className="border-0 shadow-none md:border md:shadow-sm w-full min-w-full">
        <CardHeader className="px-3 py-4 md:px-6 w-full">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
            {/* Search and Filter Section */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {filterKey && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={translations?.searchPlaceholder?.replace('{filterKey}', filterKey) || `Search by ${filterKey}...`}
                    value={
                      (filters.find(f => f.id === filterKey)?.value as string) ?? ""
                    }
                    onChange={(event) => {
                      const value = event.target.value;
                      const newFilters = filters.filter(f => f.id !== filterKey);
                      if (value) {
                        newFilters.push({ id: filterKey, value });
                      }
                      onFiltersChange(newFilters);
                    }}
                    className="pl-9 w-full sm:w-[250px] md:w-[300px]"
                  />
                </div>
              )}
            </div>

            {/* Controls Section */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Settings2 className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{translations?.columns || "Columns"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={`column-${column.id}`}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => {
                            column.toggleVisibility(!!value);
                          }}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>


        </CardHeader>

        <CardContent className="px-0 md:px-6 w-full">
          {/* Table Container with Horizontal Scroll */}
          <div className="relative w-full min-w-full">
            <div className="overflow-x-auto rounded-md border w-full min-w-full">
              <UITable className="w-full min-w-full">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            className="whitespace-nowrap px-3 py-3 text-xs font-medium md:px-4 md:text-sm"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-muted/50"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={
                              (cell.column.columnDef.meta?.cellClassName ? cell.column.columnDef.meta.cellClassName + " " : "") +
                              "whitespace-nowrap px-3 py-3 text-xs md:px-4 md:py-4 md:text-sm"
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            ) as React.ReactNode}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="text-4xl">📭</div>
                          <div className="text-sm font-medium">
                            {filterKey && filters.find(f => f.id === filterKey)?.value 
                              ? (translations?.noResults || "No results match your search")
                              : (translations?.noData || "No data found")
                            }
                          </div>
                          {Boolean(filterKey && filters.find(f => f.id === filterKey)?.value) && (
                            <div className="text-xs text-muted-foreground">
                              {translations?.clearFilter || "Try adjusting your search criteria or clear the filter"}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </UITable>
            </div>
          </div>

          {/* Bottom Pagination */}
          <div className="pt-4">
            <DataTablePagination
              pageIndex={pageIndex}
              pageSize={pageSize}
              rowCount={rowCount}
              onPaginationChange={onPaginationChange}
              translations={translations?.pagination}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
