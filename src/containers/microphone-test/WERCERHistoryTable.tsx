import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";
import { historyColumns } from "./Columns";
import { DataTable, Input, Spinner } from "@/components";
import { useTranslation } from "react-i18next";
import { useWERCERHistoryQuery } from "@/features/microphone-test/queries";
import { tMessages } from "@/locales/messages";

type WERCERHistoryTableProps = {};

const WERCERHistoryTable: React.FC<WERCERHistoryTableProps> = React.memo(
  ({}) => {
    const { t } = useTranslation();

    const { data: histories, isFetching } = useWERCERHistoryQuery();

    const [search, setSearch] = useState("");
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useReactTable({
      data: histories || [],
      columns: historyColumns,
      state: {
        sorting,
        globalFilter: search,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      globalFilterFn: "includesString",
      onGlobalFilterChange: setSearch,
    });

    return (
      <div className="w-full space-y-2">
        <p className="mb-4 w-full text-center text-xl font-bold">
          {t(tMessages.microphoneTest.historyTableTitle())}
        </p>

        {isFetching ? (
          <div className="flex h-full w-full justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="flex w-full flex-wrap gap-2 sm:gap-4">
              <Input
                className="focus-visible:ring-none w-full border border-primary-foreground bg-transparent sm:w-1/3"
                value={search}
                onChange={(event) =>
                  table.setGlobalFilter(String(event.target.value))
                }
                placeholder={t(tMessages.common.search())}
              />
            </div>
            <DataTable table={table} columns={historyColumns} />
          </>
        )}
      </div>
    );
  },
);

export default WERCERHistoryTable;
