import {
  DataTable,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TooltipModal,
} from "@/components";
import { SentimentData } from "@/features/record-audios/types";
import React from "react";
import { columns } from "./Columns";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

type SentimentTableProps = {
  data: SentimentData[];
};

const SentimentDataTable: React.FC<SentimentTableProps> = React.memo(
  ({ data }) => {
    const { t } = useTranslation();
    const [columnFilters, setColumnFilters] =
      React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useReactTable({
      data,
      columns,
      state: {
        sorting,
        columnFilters,
      },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });

    const speakerOptions = [...new Set(data.map((x) => x.speaker))];

    const onFilterSpeakers = (value: string) => {
      if (value === "all") {
        table.getColumn("speaker")?.setFilterValue(undefined);
        return;
      }
      table.getColumn("speaker")?.setFilterValue(value);
    };

    const onFilterScores = (value: string) => {
      if (value === "all") {
        table.getColumn("score")?.setFilterValue(undefined);
        return;
      }

      table.getColumn("score")?.setFilterValue(value);
    };

    return (
      <div className="mt-2 w-full space-y-2">
        <div className="flex items-center justify-between">
          <p>{t(tMessages.sentiment.dataTable())}</p>

          <TooltipModal>
            <p>{t(tMessages.sentiment.tableTooltip.title())}</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-left text-white">
              <li>
                <strong>ID:</strong>{" "}
                {t(tMessages.sentiment.tableTooltip.idDesc())}
              </li>
              <li>
                <strong>{t(tMessages.sentiment.speaker())}:</strong>{" "}
                {t(tMessages.sentiment.tableTooltip.speakerDesc())}
              </li>
              <li>
                <strong>{t(tMessages.sentiment.score())}:</strong>{" "}
                {t(tMessages.sentiment.tableTooltip.scoreDesc())}
              </li>
              <li>
                <strong>{t(tMessages.sentiment.magnitude())}:</strong>{" "}
                {t(tMessages.sentiment.tableTooltip.magnitudeDesc())}
              </li>
              <li>
                <strong>{t(tMessages.sentiment.sentence())}:</strong>{" "}
                {t(tMessages.sentiment.tableTooltip.sentenceDesc())}
              </li>
            </ul>

            <p className="mt-2">
              {t(tMessages.sentiment.tableTooltip.bottomDesc())}
            </p>
          </TooltipModal>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:gap-4">
          <Input
            className="focus-visible:ring-none w-full border border-primary-foreground sm:w-1/3"
            value={
              (table.getColumn("sentence")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("sentence")?.setFilterValue(event.target.value)
            }
            placeholder={t(tMessages.sentiment.filterSentences())}
          />

          {/* Filter speakers */}
          <Select
            value={
              (table.getColumn("speaker")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) => onFilterSpeakers(value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t(tMessages.sentiment.allSpeakers())}
              </SelectItem>
              {speakerOptions.map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter Scores */}
          <Select
            value={
              (table.getColumn("score")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={onFilterScores}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t(tMessages.sentiment.allScores())}
              </SelectItem>
              <SelectItem value="positive">
                {t(tMessages.sentiment.positiveScores())}
              </SelectItem>
              <SelectItem value="negative">
                {t(tMessages.sentiment.negativeScores())}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable table={table} columns={columns} />
      </div>
    );
  },
);

export default SentimentDataTable;
