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

const HelpTooltipModal: React.FC<HelpTooltipModalProps> = ({
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
            💬 <strong>{t(tMessages.common.presenter())}</strong> ({t(tMessages.common.recommended())})
            </p>
            <ul className="text-primary-foreground mt-2">
              <li>{t(tMessages.meetingRoleTooltip.presenterDesc1())}</li>
              <li>{t(tMessages.meetingRoleTooltip.presenterDesc2())}</li>
              <li>{t(tMessages.meetingRoleTooltip.presenterDesc3())}</li>
            </ul>
          </div>
          <div>
            <p className="text-white">
            ✏️ <strong>{t(tMessages.common.secretary())}</strong>
            </p>
            <ul className="text-primary-foreground mt-2">
              <li>{t(tMessages.meetingRoleTooltip.secretaryDesc1())}</li>
              <li>
                {t(tMessages.meetingRoleTooltip.secretaryDesc2())}
              </li>              
            </ul>
          </div>
          <div>
            <p className="font-white">
            👂 <strong>{t(tMessages.common.observer())}</strong>
            </p>
            <ul className="text-primary-foreground mt-2">
              <li>{t(tMessages.meetingRoleTooltip.observerDesc1())}</li>
              <li>{t(tMessages.meetingRoleTooltip.observerDesc2())}</li>
            </ul>
          </div>
          <div>
            <p className="font-white">
            👑 <strong>{t(tMessages.common.chairPerson())}</strong>
            </p>
            <ul className="text-primary-foreground mt-2">
              <li>{t(tMessages.meetingRoleTooltip.chairPersonDesc1())}</li>
              <li>{t(tMessages.meetingRoleTooltip.chairPersonDesc2())}</li>
            </ul>
          </div>

          <p className="text-white">
            ※<strong>{t(tMessages.meetingRoleTooltip.bottomNote())}</strong>
          </p>
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

export { HelpTooltipModal };
