import { CustomTooltip, Progress } from "@/components";
import { DataTableColumnHeader } from "@/components/shared/data-table/DataTableColumnHeader";
import { SentimentData } from "@/features/record-audios/types";
import { tMessages } from "@/locales/messages";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";

export const columns: ColumnDef<SentimentData>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="text-xs text-white/80 sm:text-sm">
        {row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "speaker",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="min-w-[40px]"
        column={column}
        title={t(tMessages.sentiment.speaker())}
      />
    ),
    cell: ({ row }) => (
      <div className="text-xs text-white/80 sm:text-sm">
        {row.getValue("speaker")}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="min-w-[60px]"
        column={column}
        title={t(tMessages.sentiment.score())}
      />
    ),
    cell: ({ row }) => {
      const score: any = row.getValue("score");
      const negativeValue = score < 0 ? Math.abs(score) * 100 : 0;
      const positiveValue = score >= 0 ? score * 100 : 0;
      return (
        <CustomTooltip
          className="w-40 bg-modal text-white/80"
          trigger={
            <div className="relative flex min-w-[50px] items-center">
              <Progress
                value={negativeValue}
                max={100}
                className="h-3 w-1/2 rotate-180 rounded-l-none"
                bgIndicator="hsl(var(--chart-1))"
              />
              <Progress
                value={positiveValue}
                max={100}
                className="h-3 w-1/2 rounded-l-none"
                bgIndicator="hsl(var(--chart-2))"
              />
            </div>
          }
        >
          <div className="text-xs sm:text-sm">
            {t(tMessages.sentiment.sentimentScore())}: {score.toFixed(2)}
          </div>
        </CustomTooltip>
      );
    },
    filterFn: (row, id, value) => {
      const cellValue: number = row.getValue(id);
      return value === "positive" ? cellValue >= 0 : cellValue < 0;
    },
  },
  {
    accessorKey: "magnitude",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="min-w-[60px]"
        column={column}
        title={t(tMessages.sentiment.magnitude())}
      />
    ),
    cell: ({ row }) => {
      const magnitude: number = row.getValue("magnitude");
      return (
        <CustomTooltip
          className="w-40 bg-modal text-white/80"
          trigger={
            <Progress
              value={Math.min(magnitude * 20, 100)}
              max={100}
              className="h-3 min-w-[50px]"
              bgIndicator="#ff9800b3"
            />
          }
        >
          {t(tMessages.sentiment.magnitude())}: {magnitude.toFixed(2)}
        </CustomTooltip>
      );
    },
  },
  {
    accessorKey: "sentence",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="min-w-[200px]"
        column={column}
        title={t(tMessages.sentiment.sentence())}
      />
    ),
    cell: ({ row }) => (
      <div className="text-xs text-white/80 sm:text-sm">
        {row.getValue("sentence")}
      </div>
    ),
  },
];
