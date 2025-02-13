import {
  Checkbox,
  CustomSlider,
  Label,
  PrimaryButton,
  VerticalDrawer,
} from "@/components";
import { ChevronSelectorVerticalIcon, UserVoiceIcon } from "@/components/icons";
import { SpeakerClonedVoice } from "@/features/settings/types";
import { tMessages } from "@/locales/messages";
import { CheckedState } from "@radix-ui/react-checkbox";
import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

type SilentThresholdSelectProps = {
  value: number;
  prevValue?: number;
  onChange?: (value: Partial<SpeakerClonedVoice>) => void;
  title?: string;
  trigger?: ReactNode;
  ratio?: number;
};

const SilentThresholdSelect: React.FC<SilentThresholdSelectProps> = React.memo(
  ({ value, prevValue = 0.1, onChange, title, trigger, ratio = 10 }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [hyperFastChbx, setHyperFastChbx] = useState(() => value === 0.01);

    const onSelect = (value: number) => {
      onChange &&
        onChange({ silentThresholdSec: value, prevSilentThresholdSec: value });
    };

    const onHyperFastChbxChange = (value: CheckedState) => {
      if (value === "indeterminate" || !onChange) return;
      setHyperFastChbx(value);
      if (value) {
        onChange({ silentThresholdSec: 0.01 });
      } else {
        onChange({ silentThresholdSec: prevValue });
      }
    };

    const fastSpeechChecked = hyperFastChbx;

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
            >
              <div className="flex grow flex-col items-start justify-between sm:flex-row sm:items-baseline">
                <span>{title}</span>
                <span className="max-w-28 overflow-hidden text-sm text-primary-foreground sm:max-w-40">
                  {value === 0.01 ? value : value * 10}
                </span>
              </div>
            </PrimaryButton>
          )
        }
        className="pb-4"
      >
        <div
          className="flex h-7 w-full items-center justify-center gap-2"
          style={{
            opacity: fastSpeechChecked ? 0.5 : 1,
          }}
        >
          <span className="shrink-0 text-sm text-primary-foreground">
            {t(tMessages.common.fastTalk())}
          </span>
          <CustomSlider
            value={[fastSpeechChecked ? prevValue : value]}
            displayedValue={`${fastSpeechChecked ? prevValue * ratio : value * ratio}`}
            max={2}
            min={0.1}
            step={0.1}
            className="grow"
            onValueChange={(value) => {
              onSelect(value[0]);
            }}
            disabled={fastSpeechChecked}
          />
          <span className="shrink-0 text-sm text-primary-foreground">
            {t(tMessages.common.usually())}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={hyperFastChbx}
            onCheckedChange={onHyperFastChbxChange}
          />
          <Label className="text-justify text-sm">
            {t(tMessages.common.highSpeed())}
          </Label>
        </div>

        <p className="mt-4 text-justify text-sm text-white">
          {t(tMessages.common.breathTimeDesc1())}
          <br />
          {t(tMessages.common.breathTimeDesc2())}
          <br />
          {t(tMessages.common.breathTimeDesc3())}
        </p>
      </VerticalDrawer>
    );
  },
);

export default SilentThresholdSelect;

