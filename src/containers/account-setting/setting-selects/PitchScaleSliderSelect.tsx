import { CustomSlider, PrimaryButton, VerticalDrawer } from "@/components";
import { ChevronSelectorVerticalIcon } from "@/components/icons";
import { tMessages } from "@/locales/messages";
import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

type PitchScaleSliderSelectProps = {
  value: number;
  onChange?: (value: number) => void;
  title?: string;
  trigger?: ReactNode;
};

const PitchScaleSliderSelect: React.FC<PitchScaleSliderSelectProps> = React.memo(
  ({ value, onChange, title, trigger }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const onSelect = (value: number) => {
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
              appendIcon={<ChevronSelectorVerticalIcon />}
            >
              <div className="flex grow flex-col items-start justify-between sm:flex-row sm:items-baseline">
                <span>{title}</span>
                <span className="max-w-28 overflow-hidden text-base text-white sm:max-w-40">
                  {value}
                </span>
              </div>
            </PrimaryButton>
          )
        }
      >
        <div className="flex h-[70px] w-full items-center justify-center gap-2">
          <span className="shrink-0 text-sm text-primary-foreground">{t(tMessages.common.low())}</span>
          <CustomSlider
            value={[value]}
            displayedValue={`${value}`}
            max={1.2}
            min={0.8}
            step={0.1}
            className="grow"
            onValueChange={(value) => {
              onSelect(value[0]);
            }}
          />
          <span className="shrink-0 text-sm text-primary-foreground">{t(tMessages.common.high())}</span>
        </div>
        <p className="py-2 text-sm">{t(tMessages.common.pitchScaleNote())}</p>
      </VerticalDrawer>
    );
  },
);

export default PitchScaleSliderSelect;
