import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { FinedTuneOption } from "@/features/record-audios/types";
import React from "react";
import { useTranslation } from "react-i18next";

type FinedTunModelSelectProps = {
  options: FinedTuneOption[];
  value: string;
  onValueChange: (value: string) => void;
};

const FinedTuneModelSelect: React.FC<FinedTunModelSelectProps> = ({
  options,
  value,
  onValueChange,
}) => {
  const { t } = useTranslation();
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="f-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-modal">
        {options.map((item) => (
          <SelectItem
            className="cursor-none text-white focus:bg-primary-foreground"
            key={item.value}
            value={item.value}
          >
            {t(item.title())}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FinedTuneModelSelect;
