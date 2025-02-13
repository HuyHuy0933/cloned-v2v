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

const UsageTooltipModal: React.FC<HelpTooltipModalProps> = ({
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
        <div className="flex max-h-[80dvh] w-full flex-col gap-4 overflow-auto text-start text-sm text-white/80 sm:text-base">
        <ul className="space-y-2">
            <li className="border-b-[1px] border-neutral-600 border-dashed pb-1">
              🎤 <strong>{t(tMessages.usageTooltip.numVoiceClones())}</strong>: 
              <span className="ml-2">{t(tMessages.usageTooltip.numVoiceClonesDesc())}</span>
            </li>
            <li className="border-b-[1px] border-neutral-600 border-dashed pb-1">
              🎤 <strong>{t(tMessages.usageTooltip.numVoiceSamples())}</strong>: 
              <span className="ml-2">{t(tMessages.usageTooltip.numVoiceSamplesDesc())}</span>
            </li>
            <li className="border-b-[1px] border-neutral-600 border-dashed pb-1">
              💾 <strong>{t(tMessages.usageTooltip.storageUsage())}</strong>: 
              <span className="ml-2">{t(tMessages.usageTooltip.storageUsageDesc())}</span>
            </li>
            <li className="border-b-[1px] border-neutral-600 border-dashed pb-1">
              🔇 <strong>{t(tMessages.usageTooltip.noiseReductionTime())}</strong>: 
              <span className="ml-2">{t(tMessages.usageTooltip.noiseReductionTimeDesc())}</span>
            </li>
            <li className="border-b-[1px] border-neutral-600 border-dashed pb-1">
              🤖 <strong>{t(tMessages.usageTooltip.AIUsageToken())}</strong>: 
              <span className="ml-2">{t(tMessages.usageTooltip.AIUsageTokenDesc())}</span>
            </li>
            <li className="border-b-[1px] border-neutral-600 border-dashed pb-1">
              🕒 <strong>{t(tMessages.usageTooltip.meetingJoinTime())}</strong>: 
              <span className="ml-2">{t(tMessages.usageTooltip.meetingJoinTimeDesc())}</span>
            </li>
            <li className="border-b-[1px] border-neutral-600 border-dashed pb-1">
              📝 <strong>{t(tMessages.usageTooltip.STTUsageTime())}</strong>: 
              <span className="ml-2">{t(tMessages.usageTooltip.STTUsageTimeDesc())}</span>
            </li>
            <li className="border-b-[1px] border-neutral-600 border-dashed pb-1">
              🔊 <strong>{t(tMessages.usageTooltip.TTSUsageTime())}</strong>: 
              <span className="ml-2">{t(tMessages.usageTooltip.TTSUsageTimeDesc())}</span>
            </li>
            <li className="border-b-[1px] border-neutral-600 border-dashed pb-1">
              🔊 <strong>{t(tMessages.usageTooltip.numTTSCharacters())}</strong>:
              <span className="ml-2">{t(tMessages.usageTooltip.numTTSCharactersDesc())}</span>
            </li>
            <li>
              🔤 <strong>{t(tMessages.usageTooltip.transCharacterCount())}</strong>:
              <span className="ml-2">{t(tMessages.usageTooltip.transCharacterCountDesc())}</span>
            </li>
          </ul>
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

export { UsageTooltipModal };
