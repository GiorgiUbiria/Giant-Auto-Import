"use client";

import * as React from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  Table,
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
    <div className="mx-auto container-fluid">
      <div className="flex gap-4 pb-4">
        <div className="flex flex-col gap-2.5 container pl-2">
          <DataTablePagination
            pageIndex={pageIndex}
            pageSize={pageSize}
            rowCount={rowCount}
            onPaginationChange={onPaginationChange}
          />
        </div>
        {filterKey && (
          <div className="flex items-center">
            <Input
              placeholder={`Filter by ${filterKey}`}
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
              className="max-w-sm"
            />
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <UITable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                  index={index}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>
    </div>
  );
}
