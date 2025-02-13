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

const PrivateMeetingTooltip: React.FC<HelpTooltipModalProps> = ({
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
        <div className="flex max-h-[80dvh] w-full flex-col gap-4 overflow-auto text-justify text-sm text-white/80 sm:text-base">
          <div>
            <p className="text-white">
            🔒 <strong>{t(tMessages.privateMeetingTooltip.title())}</strong>
            </p>
            <ul className="list-disc text-primary-foreground mt-2">
              <li>{t(tMessages.privateMeetingTooltip.desc1())}</li>
              <li>{t(tMessages.privateMeetingTooltip.desc2())}</li>
              <li>{t(tMessages.privateMeetingTooltip.desc3())}</li>
              <li>{t(tMessages.privateMeetingTooltip.desc4())}</li>
            </ul>
          </div>          
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

export { PrivateMeetingTooltip };
