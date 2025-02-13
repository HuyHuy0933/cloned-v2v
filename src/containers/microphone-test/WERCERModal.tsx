import {
  DataTable,
  DataTableColumnHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  IconButton,
} from "@/components";
import {
  WERCER_TOKEN_TYPE,
  WERCERResult,
  WERCERResultToken,
  WERCERResultColumn,
  WERCERLegendColumn,
} from "@/features/microphone-test/types";
import { tMessages } from "@/locales/messages";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Separator } from "@radix-ui/react-select";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { t } from "i18next";
import React from "react";
import { useTranslation } from "react-i18next";
import { legendColumns, resultColumns } from "./Columns";

const color: Record<string, string> = {
  [WERCER_TOKEN_TYPE.EQUAL]: "hsl(var(--success))",
  [WERCER_TOKEN_TYPE.SUBSTITUTE]: "#FF0000",
  [WERCER_TOKEN_TYPE.INSERT]: "#FFFF00",
  [WERCER_TOKEN_TYPE.DELETE]: "#FFA500",
};
type WERCERModalProps = {
  onClose: () => void;
  result: WERCERResult;
};

const WERCERModal: React.FC<WERCERModalProps> = ({ onClose, result }) => {
  const { t } = useTranslation();

  const wercerResultTable = useReactTable({
    data: [
      {
        item: t(tMessages.microphoneTest.wercerModal.numberCorrectWord()),
        value: result.hits,
      },
      {
        item: t(tMessages.microphoneTest.wercerModal.numberReplacedWord()),
        value: result.substitutions,
      },
      {
        item: t(tMessages.microphoneTest.wercerModal.numberInsertedWord()),
        value: result.insertions,
      },
      {
        item: t(tMessages.microphoneTest.wercerModal.numberDeletedWord()),
        value: result.deletions,
      },
      {
        item: t(tMessages.microphoneTest.wercerModal.werErrorRate()),
        value: result.wer.toFixed(2),
      },
    ],
    columns: resultColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const wercerLegendTable = useReactTable({
    data: [
      {
        item: t(tMessages.microphoneTest.wercerModal.legend1()),
        desc: t(tMessages.microphoneTest.wercerModal.legend1Desc()),
        value: t(tMessages.microphoneTest.wercerModal.legendValue(), {
          value: 75,
        }),
      },
      {
        item: t(tMessages.microphoneTest.wercerModal.legend2()),
        desc: t(tMessages.microphoneTest.wercerModal.legend2Desc()),
        value: t(tMessages.microphoneTest.wercerModal.legendValue(), {
          value: 85,
        }),
      },
      {
        item: t(tMessages.microphoneTest.wercerModal.legend3()),
        value: t(tMessages.microphoneTest.wercerModal.legendValue(), {
          value: 95,
        }),
      },
    ],
    columns: legendColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Dialog open={true}>
      <DialogContent className="max-h-[80%] w-[90%] max-w-xl overflow-auto px-3 sm:px-6 md:w-[700px]">
        <DialogHeader className="h-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="w-full">
          <p className="mb-2 w-full text-center text-xl font-bold text-success">
            {t(tMessages.microphoneTest.wercerModal.recogAccuracy())}:{" "}
            {result.accuracy.toFixed(2)}%
          </p>
          <div>
            <DataTable
              table={wercerResultTable}
              columns={resultColumns}
              noPagination
            />
          </div>
          <Separator className="my-4 h-[1px] bg-primary-foreground" />
          <DataTable
            table={wercerLegendTable}
            columns={legendColumns}
            noPagination
          />
          <Separator className="my-4 h-[1px] bg-primary-foreground" />

          <div
            id="wercer-modal__visualize"
            className="w-full space-y-4 rounded-sm border border-primary-foreground p-4"
          >
            <p className="w-full text-center text-xl font-bold">
              {t(tMessages.microphoneTest.wercerModal.visualizeTitle())}
            </p>

            <p className="w-full space-x-2 text-center">
              {result.tokens.map((item: WERCERResultToken, index: number) => (
                <span key={index} style={{ color: color[item.type] }}>
                  {item.text.join(" ")}
                </span>
              ))}
            </p>
          </div>
        </div>

        <IconButton
          type="button"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <Cross1Icon className="size-5" />
        </IconButton>
      </DialogContent>
    </Dialog>
  );
};

export default WERCERModal;
