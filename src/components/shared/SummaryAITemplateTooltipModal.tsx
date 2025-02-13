import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { IconButton } from "./IconButton";
import { QuestionMarkIcon } from "../icons";
import { Cross1Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { useAISummaryTemplateData } from "@/containers/record-audios/useAISummaryTemplateData";
import { TemplateDetail } from "@/features/record-audios/types";

type SummaryAITemplateTooltipModalProps = {
  className?: string;
  iconClassName?: string;
};

const SummaryAITemplateTooltipModal: React.FC<
  SummaryAITemplateTooltipModalProps
> = ({ className = "", iconClassName }) => {
  const { t } = useTranslation();

  const { data } = useAISummaryTemplateData();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton
          className={className}
        >
          <QuestionMarkIcon className={cn("size-5 transition duration-200 hover:scale-[1.2]", iconClassName)} />
        </IconButton>
      </DialogTrigger>

      <DialogContent className="sm:[70%] max-h-[90vh] w-[90%] max-w-full overflow-hidden border-none px-3 sm:px-5">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex h-auto max-h-[65vh] w-full flex-col gap-4 overflow-auto pr-2 text-justify text-sm text-white/80 sm:text-base">
          <p>{t(tMessages.summaryAITemplateDetail.description())}</p>

          <div>
            <ul className="mt-2 list-inside list-decimal space-y-2">
              {data.map((template: TemplateDetail, index: number) => (
                <li key={`template_${index + 1}`}>
                  <span>
                    {template.icon} {template.title}
                  </span>
                  <ul className="mt-1 list-inside list-square overflow-auto rounded-md border border-primary p-2">
                    {Array.from(template.sections.values()).map(
                      (item: string, index: number) => (
                        <li key={`template_item_${index + 1}`}>{item}</li>
                      ),
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogClose asChild>
          <IconButton type="button" className="absolute right-4 top-6">
            <Cross1Icon className="size-5" />
          </IconButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export { SummaryAITemplateTooltipModal };
