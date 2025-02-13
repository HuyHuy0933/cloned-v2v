import { Label, PrimaryButton, VerticalDrawer } from "@/components";
import { CheckIcon, ChevronSelectorVerticalIcon } from "@/components/icons";
import { OptionItem } from "@/features/settings/types";
import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

type OptionSelectProps = {
  value: string;
  onChange?: (value: string) => void;
  options: OptionItem[];
  label?: ReactNode;
  disabled?: boolean;
  trigger?: ReactNode;
  triggerClass?: string;
  disabledOption?: (value: OptionItem["value"]) => boolean;
  bottomContent?: ReactNode;
};

const OptionSelect: React.FC<OptionSelectProps> = React.memo(
  ({
    value,
    onChange,
    options,
    disabled,
    label,
    trigger,
    triggerClass = "",
    disabledOption,
    bottomContent,
  }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const selectedOption = options.find((x) => x.value === value);

    const onSelect = (value: string) => {
      setOpen(false);
      onChange && onChange(value);
    };

    return (
      <div className="flex flex-col">
        {label && <Label className="mb-1 text-sm">{label}</Label>}
        <VerticalDrawer
          open={open}
          onOpenChange={setOpen}
          trigger={
            trigger ||
            (selectedOption && (
              <PrimaryButton
                className={triggerClass}
                prependIcon={selectedOption.icon ? selectedOption.icon : undefined}
                appendIcon={<ChevronSelectorVerticalIcon />}
                disabled={disabled}
              >
                {typeof selectedOption.title === "function" ? t(selectedOption.title()) : selectedOption.title}
              </PrimaryButton>
            ))
          }
        >
          <>
            {options.map((mode: OptionItem) => (
              <PrimaryButton
                key={mode.value}
                onClick={() => onSelect(mode.value)}
                prependIcon={mode.icon ? mode.icon : undefined}
                appendIcon={
                  mode.value === value ? (
                    <CheckIcon className="shrink-0" />
                  ) : undefined
                }
                disabled={disabledOption && disabledOption(mode.value)}
              >
                {typeof mode.title === "function"
                  ? t(mode.title())
                  : mode.title}
              </PrimaryButton>
            ))}
            {bottomContent && (
              <div className="mt-2 text-sm">{bottomContent}</div>
            )}
          </>
        </VerticalDrawer>
      </div>
    );
  },
);

export { OptionSelect };