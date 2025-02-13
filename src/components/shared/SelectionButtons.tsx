import { ReactNode } from "react";
import { Button } from "../ui/button";
import { motion } from "motion/react"
import { TranslationFunc } from "@/locales/messages";
import { useTranslation } from "react-i18next";

export type SelectionOption = {
  title: TranslationFunc;
  value: string;
  icon?: React.FC<any>;
  image?: ReactNode;
};

export type SelectionButtonsProps = {
  options: SelectionOption[];
  value: string;
  onValueChange: (value: string) => void;
};

const SelectionButtons: React.FC<SelectionButtonsProps> = ({
  options,
  value,
  onValueChange,
}) => {
  const {t} = useTranslation()
  const height = !value ? 148 : 52;
  return (
    <motion.div
      className="flex w-full gap-1"
      initial={{ height: 0 }}
      animate={{ height }}
      transition={{ duration: 0.3 }}
    >
      {options.length > 0 &&
        options.map((item: SelectionOption) => {
          const Icon = item.icon;

          const bgClass = value === item.value ? "bg-white/25" : "bg-primary";
          let textColorClass = "text-white";

          if (!!value) {
            textColorClass =
              value === item.value ? "text-white" : "text-primary-foreground";
          }

          const classes = `flex flex-col items-center justify-center rounded-none text-base 
            first:rounded-bl-2xl first:rounded-tl-2xl last:rounded-br-2xl last:rounded-tr-2xl h-auto overflow-hidden ${bgClass} ${textColorClass}`;
          return (
            <Button
              key={item.value}
              className={classes}
              onClick={() => onValueChange(item.value)}
              style={{
                width: `${100 / options.length}%`,
              }}
            >
              <span className="flex items-center gap-2">
                {Icon && (
                  <Icon
                    className={`${item.value === value ? "opacity-100" : "opacity-50"} size-6`}
                  />
                )}
                {t(item.title())}
              </span>

              {!value && item.image}
            </Button>
          );
        })}
    </motion.div>
  );
};

export { SelectionButtons };
