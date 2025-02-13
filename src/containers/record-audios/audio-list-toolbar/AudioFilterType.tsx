import { Checkbox, Label } from "@/components";
import {
  MEETING_BOT_TYPE,
  RECORDED_AUDIO_TYPE,
} from "@/features/record-audios/types";
import { tMessages } from "@/locales/messages";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const filterTypes = [{}];

type AudioFilterTypeProps = {
  filter: string;
  onFilterChange: (filter: string) => void;
};

const AudioFilterType: React.FC<AudioFilterTypeProps> = React.memo(
  ({ filter, onFilterChange }) => {
    const { t } = useTranslation();
    const [filterOptions] = useState<{ value: string; title: string }[]>([
      {
        value: "",
        title: t(tMessages.common.all()),
      },
      {
        value: RECORDED_AUDIO_TYPE.RECORDER,
        title: t(tMessages.common.recording()),
      },
      {
        value: RECORDED_AUDIO_TYPE.MEETING,
        title: "V2V",
      },
      {
        value: MEETING_BOT_TYPE.TEAMS,
        title: "Teams",
      },
      {
        value: RECORDED_AUDIO_TYPE.UPLOAD,
        title: t(tMessages.common.upload()),
      },
    ]);

    return (
      <div className="flex gap-2 overflow-x-auto overflow-y-hidden">
        {filterOptions.map((item) => (
          <Label
            key={item.value}
            className="relative flex h-9 shrink-0 items-center justify-center rounded bg-primary px-4 py-2 text-xs text-white hover:bg-primary-foreground sm:text-sm"
            style={{
              backgroundColor: filter === item.value ? "#797979" : "",
            }}
          >
            <Checkbox
              id={item.value}
              checked={item.value === filter}
              className="sr-only after:absolute after:inset-0"
              onCheckedChange={() => onFilterChange(item.value)}
            />

            {item.title}
          </Label>
        ))}
      </div>
    );
  },
);

export default AudioFilterType;
