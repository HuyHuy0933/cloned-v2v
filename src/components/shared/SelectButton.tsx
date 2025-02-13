import React, { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { PrimaryButton } from "./PrimaryButton";
import { CheckIcon, ChevronSelectorVerticalIcon } from "../icons";

export type SelectOptionObject = {
  title: string;
  value: string | number;
};

type SelectButtonProps<T extends string | number | SelectOptionObject> = {
  value: T;
  onValueChange?: (value: T) => void;
  options: T[];
  optionItem?: (item: T) => ReactNode;
  title?: string;
  trigger?: ReactNode;
};

const SelectButton = <T extends string | number | SelectOptionObject>({
  value,
  onValueChange,
  options,
  optionItem,
  title,
  trigger,
}: SelectButtonProps<T>) => {
  const isMatch = (item: T) => {
    const itemValue = typeof item === "object" ? item.value : value;
    const selectedValue = typeof value === "object" ? value.value : value;

    return itemValue === selectedValue;
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <PrimaryButton appendIcon={<ChevronSelectorVerticalIcon />}>
            {typeof value === "object" ? value.title : value}
          </PrimaryButton>
        )}
      </DrawerTrigger>
      <DrawerContent className="max-h-[50%] flex-col rounded-t-sm border-none bg-[#313131]">
        <div className={`mx-auto w-full max-w-md overflow-auto px-4`}>
          <DrawerHeader className="flex p-0 pb-4">
            <DrawerTitle className="text-base font-medium text-white">
              {title}
            </DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 pb-4">
            {options.map((item: T) => {
              if (optionItem) {
                return optionItem(item);
              }

              return (
                <PrimaryButton
                  key={typeof item === "object" ? item.value : item}
                  prependIcon={isMatch(item) ? <CheckIcon /> : undefined}
                  onClick={() => onValueChange && onValueChange(item)}
                >
                  {typeof item === "object" ? item.title : item}
                </PrimaryButton>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export {SelectButton};
