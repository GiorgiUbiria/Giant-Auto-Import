import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  rowCount: number;
  onPaginationChange: (updater: { pageIndex: number; pageSize: number }) => void;
  pageSizeOptions?: number[];
  translations?: {
    showing: string;
    rowsPerPage: string;
    page: string;
    goToFirst: string;
    goToPrevious: string;
    goToNext: string;
    goToLast: string;
  };
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  rowCount,
  onPaginationChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
  translations,
}: DataTablePaginationProps) {

  const pageCount = Math.ceil(rowCount / pageSize);
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, rowCount);

  return (
    <div className="flex w-full flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Results info */}
      <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:items-center sm:gap-4">
        <div className="whitespace-nowrap font-medium">
          {translations?.showing?.replace('{start}', String(rowCount > 0 ? startItem : 0))
            .replace('{end}', String(endItem))
            .replace('{total}', String(rowCount)) ||
            `Showing ${rowCount > 0 ? startItem : 0} to ${endItem} of ${rowCount} results`
          }
        </div>

        {/* Rows per page control */}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm font-medium">{translations?.rowsPerPage || "Rows per page:"}</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPaginationChange({ pageIndex: 0, pageSize: Number(value) });
            }}
          >
            <SelectTrigger className="h-9 w-20 text-sm border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top" align="end" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between sm:justify-end">
        {/* Page info */}
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 sm:mr-4">
          <span className="whitespace-nowrap">
            {translations?.page?.replace('{current}', String(pageCount > 0 ? pageIndex + 1 : 0))
              .replace('{total}', String(pageCount)) ||
              `Page ${pageCount > 0 ? pageIndex + 1 : 0} of ${pageCount}`
            }
          </span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Button
            aria-label={translations?.goToFirst || "Go to first page"}
            variant="outline"
            size="sm"
            className="hidden h-9 w-9 p-0 md:flex border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
            onClick={() => onPaginationChange({ pageIndex: 0, pageSize })}
            disabled={!canPreviousPage}
          >
            <ArrowLeftIcon className="h-3 w-3" />
          </Button>

          <Button
            aria-label={translations?.goToPrevious || "Go to previous page"}
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
            onClick={() => onPaginationChange({ pageIndex: Math.max(0, pageIndex - 1), pageSize })}
            disabled={!canPreviousPage}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <Button
            aria-label={translations?.goToNext || "Go to next page"}
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
            onClick={() => onPaginationChange({ pageIndex: Math.min(pageCount - 1, pageIndex + 1), pageSize })}
            disabled={!canNextPage}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          <Button
            aria-label={translations?.goToLast || "Go to last page"}
            variant="outline"
            size="sm"
            className="hidden h-9 w-9 p-0 md:flex border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
            onClick={() => onPaginationChange({ pageIndex: pageCount - 1, pageSize })}
            disabled={!canNextPage}
          >
            <ArrowRightIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
