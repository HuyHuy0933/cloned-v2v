import { Label, PrimaryButton, VerticalDrawer } from "@/components";
import { CheckIcon, ChevronSelectorVerticalIcon } from "@/components/icons";
import { LanguageOption } from "@/lib/constaints";
import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

type LanguageSelectProps = {
  value: LanguageOption;
  onChange?: (value: LanguageOption) => void;
  options: LanguageOption[];
  label?: ReactNode;
  disabled?: boolean;
  trigger?: ReactNode;
  triggerClass?: string;
};

const LanguageSelect: React.FC<LanguageSelectProps> = React.memo(
  ({
    value,
    onChange,
    options,
    disabled,
    label,
    triggerClass = "",
    trigger,
  }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const onSelect = (value: LanguageOption) => {
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
            trigger || (
              <PrimaryButton
                className={triggerClass}
                appendIcon={<ChevronSelectorVerticalIcon />}
                disabled={disabled}
                childClass="gap-4"
              >
                <img src={value.flagUrl} alt="flag" width={15} />
                {t(value.title())}
              </PrimaryButton>
            )
          }
        >
          {options.map((option: LanguageOption) => (
            <PrimaryButton
              key={option.code}
              onClick={() => onSelect(option)}
              prependIcon={
                <img src={option.flagUrl} alt={option.flagUrl} width={20} />
              }
              appendIcon={
                option.code === value.code ? <CheckIcon /> : undefined
              }
              className="h-[52px] justify-start rounded-2xl"
            >
              {t(option.title())}
            </PrimaryButton>
          ))}
        </VerticalDrawer>
      </div>
    );
  },
);

export { LanguageSelect };
