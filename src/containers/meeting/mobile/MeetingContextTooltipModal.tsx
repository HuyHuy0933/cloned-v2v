import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  IconButton,
} from "@/components";
import { Cross1Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { QuestionMarkIcon } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

type HelpTooltipModalProps = {
  className?: string;
  iconClassName?: string;
};

const MeetingContextTooltipModal: React.FC<HelpTooltipModalProps> = ({
  className = "",
  iconClassName,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton className={className}>
          <QuestionMarkIcon className={cn("size-5 transition duration-200 hover:scale-[1.2]", iconClassName)} />
        </IconButton>
      </DialogTrigger>
      <DialogContent className="sm:[70%] w-[90%] max-w-full border-none px-3 sm:px-6">
        <DialogHeader className="h-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[80dvh] w-full flex-col gap-4 overflow-auto pt-4 text-justify text-sm text-white/80 sm:text-base">
          {t(tMessages.meetingCtxTooltip.desc())}
        </div>
        <DialogClose asChild>
          <IconButton type="button" className="absolute right-4 top-4">
            <Cross1Icon className="size-5" />
          </IconButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export { MeetingContextTooltipModal };
