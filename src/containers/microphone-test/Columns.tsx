import { DataTableColumnHeader } from "@/components";
import {
  WERCERHistory,
  WERCERLegendColumn,
  WERCERResultColumn,
} from "@/features/microphone-test/types";
import { useCurrentUser } from "@/hooks";
import { allLanguages } from "@/lib/constaints";
import { formatDateTimeLocale } from "@/lib/datetime";
import { tMessages } from "@/locales/messages";
import { ColumnDef } from "@tanstack/react-table";
import { fromUnixTime } from "date-fns";
import { t } from "i18next";

export const resultColumns: ColumnDef<WERCERResultColumn>[] = [
  {
    accessorKey: "item",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t(tMessages.microphoneTest.wercerModal.item())}
      />
    ),
    cell: ({ row }) => (
      <div className="text-xs text-white/80 sm:text-sm">
        {row.getValue("item")}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t(tMessages.microphoneTest.wercerModal.value())}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs text-white/80 sm:text-sm">
          {row.getValue("value")}
        </div>
      );
    },
    enableSorting: false,
    size: 60,
  },
];

export const legendColumns: ColumnDef<WERCERLegendColumn>[] = [
  {
    accessorKey: "item",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t(tMessages.microphoneTest.wercerModal.recogAccuracy())}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs text-white/80 sm:text-sm">
          <p>{row.getValue("item")}</p>
          {!!row.original.desc && <p>{row.original.desc}</p>}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t(tMessages.microphoneTest.wercerModal.targetValue())}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs text-white/80 sm:text-sm">
          {row.getValue("value")}
        </div>
      );
    },
    enableSorting: false,
    size: 60,
  },
];

export const historyColumns: ColumnDef<WERCERHistory>[] = [
  {
    accessorKey: "datetime",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t(tMessages.common.date())}
      />
    ),
    cell: ({ row }) => {
      const { setting } = useCurrentUser();
      const datetime: number = row.getValue("datetime");
      return (
        <div className="text-xs text-white/80 sm:text-sm min-w-[100px]">
          <p>
            {formatDateTimeLocale(
              fromUnixTime(datetime / 1000),
              setting.language,
            )}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "microphone",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t(tMessages.microphoneTest.microphoneDevice())}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="min-w-[100px] text-xs text-white/80 sm:text-sm">
          <p>{row.getValue("microphone")}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="WER/CER" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs text-white/80 sm:text-sm">
          <p>{row.getValue("type")}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "totalWords",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t(tMessages.microphoneTest.totalWords())}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs text-white/80 sm:text-sm">
          <p>{row.getValue("totalWords")}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "language",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t(tMessages.common.language())}
      />
    ),
    cell: ({ row }) => {
      const language = row.getValue("language");
      return (
        <div className="text-xs text-white/80 sm:text-sm">
          <p>{t(allLanguages.find((x) => x.code === language)?.title())}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "accuracy",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={`${t(tMessages.microphoneTest.accuracy())} (%)`}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs text-white/80 sm:text-sm">
          <p>{(row.getValue("accuracy") as Number).toFixed(2)}%</p>
        </div>
      );
    },
  },
];
