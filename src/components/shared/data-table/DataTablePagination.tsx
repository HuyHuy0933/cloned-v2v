import { Table } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation();
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const total = table.getFilteredRowModel().rows.length;
  const itemIndexFrom = pageIndex * pageSize + 1;
  const itemIndexTo = itemIndexFrom + pageSize - 1;
  const displayedTo = itemIndexTo > total ? total : itemIndexTo;

  const pages = useMemo(() => new Array(pageCount).fill(0), [pageCount]);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-white/80 sm:text-sm">
      <div className="flex-1">
        {t(tMessages.common.showingPageRowsOfTotal(), {
          from: itemIndexFrom,
          to: displayedTo,
          total,
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center space-x-2">
          <p className="font-medium">{t(tMessages.common.rowsPerPage())}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center font-medium">
          {t(tMessages.common.pageIndexOfTotal(), {
            page: pageIndex + 1,
            total: pageCount,
          })}
        </div>
        <div className="flex items-center space-x-2">
          {pages.map((_, index) => (
            <Button
              key={index + 1}
              className={`h-8 w-8 p-0 ${pageIndex === index ? "bg-primary-foreground" : "bg-primary"}`}
              onClick={() => table.setPageIndex(index)}
            >
              <span>{index + 1}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
