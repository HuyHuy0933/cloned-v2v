import { PrimaryButton, VerticalDrawer } from "@/components";
import { CheckIcon, ChevronSelectorVerticalIcon } from "@/components/icons";
import { AudioDeviceInfo } from "@/features/devices/types";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import React, { ReactNode, useState } from "react";

type AudioDeviceSelectProps = {
  value: AudioDeviceInfo;
  onChange?: (value: AudioDeviceInfo) => void;
  options: AudioDeviceInfo[];
  disabled?: boolean;
  title?: string;
  trigger?: ReactNode;
  triggerClass?: string;
  bottomContent?: ReactNode;
};

const AudioDeviceSelect: React.FC<AudioDeviceSelectProps> = React.memo(
  ({ value, onChange, options, disabled, trigger, triggerClass, bottomContent }) => {
    const [open, setOpen] = useState(false);
    const title = options.find((x) => x.deviceId === value.deviceId)?.label;

    const onSelect = (value: AudioDeviceInfo) => {
      setOpen(false);
      onChange && onChange(value);
    };

    return (
      <VerticalDrawer
        open={open}
        onOpenChange={setOpen}
        trigger={
          trigger ||
          (title && (
            <PrimaryButton
              className={triggerClass}
              appendIcon={<ChevronSelectorVerticalIcon />}
              disabled={disabled}
            >
              {title}
            </PrimaryButton>
          ))
        }
      >
        <>
          {options.map((option: AudioDeviceInfo) => (
            <PrimaryButton
              key={option.deviceId}
              onClick={() => onSelect(option)}
              appendIcon={
                option.deviceId === value.deviceId ? (
                  <CheckIcon className="shrink-0" />
                ) : undefined
              }
            >
              {option.label}
            </PrimaryButton>
          ))}
          {bottomContent && <div className="mt-2 text-sm">{bottomContent}</div>}
        </> 
      </VerticalDrawer>
    );
  },
);

export default AudioDeviceSelect;
