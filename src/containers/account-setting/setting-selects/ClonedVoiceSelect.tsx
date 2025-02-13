import { PrimaryButton, VerticalDrawer } from "@/components";
import {
  CheckIcon,
  ChevronSelectorVerticalIcon,
  UserVoiceIcon,
} from "@/components/icons";
import { ElevenLabsVoice } from "@/features/cloned-voices/types";
import { SpeakerClonedVoice } from "@/features/settings/types";
import React, { ReactNode, useState } from "react";

type ClonedVoiceSelectProps = {
  value: SpeakerClonedVoice;
  onChange?: (value: ElevenLabsVoice) => void;
  options: ElevenLabsVoice[];
  disabled?: boolean;
  title?: string;
  trigger?: ReactNode;
};

const ClonedVoiceSelect: React.FC<ClonedVoiceSelectProps> = React.memo(
  ({ value, onChange, options, disabled, title, trigger }) => {
    const [open, setOpen] = useState(false);

    const onSelect = (value: ElevenLabsVoice) => {
      setOpen(false);
      onChange && onChange(value);
    };

    return (
      <VerticalDrawer
        open={open}
        onOpenChange={setOpen}
        trigger={
          trigger || (
            <PrimaryButton
              className="w-full justify-start gap-2 px-1 sm:justify-center sm:gap-4 sm:px-4"
              prependIcon={<UserVoiceIcon />}
              appendIcon={<ChevronSelectorVerticalIcon />}
              disabled={disabled}
            >
              <div className="flex grow flex-col items-start justify-between sm:flex-row sm:items-baseline">
                <span>{title}</span>
                <span className="max-w-28 overflow-hidden text-primary-foreground sm:max-w-40 text-sm">
                  {value.name}
                </span>
              </div>
            </PrimaryButton>
          )
        }
      >
        {options.map((v: ElevenLabsVoice) => (
          <PrimaryButton
            key={v.id}
            onClick={() => onSelect(v)}
            appendIcon={v.id === value.id ? <CheckIcon /> : undefined}
          >
            {v.name}
          </PrimaryButton>
        ))}
      </VerticalDrawer>
    );
  },
);

export default ClonedVoiceSelect;
