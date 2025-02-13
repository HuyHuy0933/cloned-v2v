import { UsersIcon } from "@/components/icons";
import { RecordedAudio } from "@/features/record-audios/types";
import { formatDateTimeLocale } from "@/lib/datetime";
import { CalendarIcon } from "@radix-ui/react-icons";
import { fromUnixTime } from "date-fns";
import React from "react";
import { renderTypeIcon } from "./AudioItem";
import { useTranslation } from "react-i18next";

type MeetingAudioItemProps = {
  audio: RecordedAudio;
};
const MeetingAudioItem: React.FC<MeetingAudioItemProps> = React.memo(({ audio }) => {
  const { i18n } = useTranslation();
  return (
      <div className="relative flex h-full grow flex-col items-start justify-center gap-2 overflow-x-hidden">
        <span
          className={`w-auto overflow-hidden text-nowrap text-sm font-semibold`}
        >
          {audio.name}
        </span>
        <div className="flex items-center gap-2 text-primary-foreground sm:gap-4">
          <span className="text-[10px] sm:text-xs">
            <CalendarIcon className="float-left mr-2" />
            {formatDateTimeLocale(
              fromUnixTime(audio.startDateTime / 1000),
              i18n.language,
            )}
          </span>

          <span className="text-[10px] sm:text-xs">
            <UsersIcon className="float-left mr-1 size-4" />
            {audio.participants.length}
          </span>

          {renderTypeIcon(audio)}
        </div>
      </div>
  );
});

export default MeetingAudioItem;
