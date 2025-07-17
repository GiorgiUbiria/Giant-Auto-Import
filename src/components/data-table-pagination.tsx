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
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  rowCount,
  onPaginationChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps) {
  const pageCount = Math.ceil(rowCount / pageSize);
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  return (
    <div className="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8">
      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPaginationChange({ pageIndex: 0, pageSize: Number(value) });
            }}
          >
            <SelectTrigger className="h-8 w-[4.5rem]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          Page {pageIndex + 1} of {pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => onPaginationChange({ pageIndex: 0, pageSize })}
            disabled={!canPreviousPage}
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPaginationChange({ pageIndex: Math.max(0, pageIndex - 1), pageSize })}
            disabled={!canPreviousPage}
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPaginationChange({ pageIndex: Math.min(pageCount - 1, pageIndex + 1), pageSize })}
            disabled={!canNextPage}
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => onPaginationChange({ pageIndex: pageCount - 1, pageSize })}
            disabled={!canNextPage}
          >
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
