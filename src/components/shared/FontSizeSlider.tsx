import React from "react";
import { Slider } from "../ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { IconButton } from "./IconButton";
import { FontSizeIcon } from "../icons";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

type SliderProps = React.ComponentProps<typeof Slider>;

const FontSizeSlider: React.FC<SliderProps> = ({ className, ...props }) => {
  const { t } = useTranslation();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton className="h-9 transition duration-200 hover:scale-[1.2] flex-col justify-between">
          <FontSizeIcon />
          <span className="text-[8px] leading-3">Size</span>
        </IconButton>
      </PopoverTrigger>
      <PopoverContent
        className="w-[180px] border-none bg-modal text-sm text-white"
        align="end"
      >
        <span>{t(tMessages.common.fontSize())}</span>
        <Slider className="my-3 w-full" {...props} />
        <div className="flex justify-between text-xs text-primary-foreground">
          <span>{t(tMessages.common.smaller())}</span>
          <span>{t(tMessages.common.bigger())}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { FontSizeSlider };
