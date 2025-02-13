import { UserAvatar } from "@/components";
import { WavingHandIcon } from "@/components/icons";
import { ComputedMeetingUser } from "@/features/meeting/types";
import { secondsToDurationFormatLocale } from "@/lib/datetime";
import { tMessages } from "@/locales/messages";
import React from "react";
import { useTranslation } from "react-i18next";

type PCUserListProps = {
  users: ComputedMeetingUser[];
  speakingUserId?: string;
  currentUserId?: string;
};
const PCUserList: React.FC<PCUserListProps> = React.memo(
  ({ users, speakingUserId, currentUserId }) => {
    const { t } = useTranslation();
    return (
      <div className="mt-6 flex h-0 grow flex-col gap-4 overflow-auto">
        {users.map((user: ComputedMeetingUser) => (
          <div
            className={`flex h-[64px] w-full shrink-0 items-center justify-between rounded-2xl bg-gray-98 px-4 ${user.userId === speakingUserId ? "bg-gradient-lime-25" : ""}`}
            key={`participant-${user.userId}`}
          >
            <div className="flex items-center">
              <UserAvatar className="size-8" username={user.username} />
              <span className="ml-3">{user.username}</span>
              {currentUserId === user.userId && (
                <span className="ml-3">({t(tMessages.common.you())})</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {user.isNextSpeaker && (
                <WavingHandIcon className="inline-block size-4 origin-[80%_100%] rotate-[17deg] animate-wave" />
              )}
              <span className="text-xs text-gray-52">
                {user.speakingDurationTime !== undefined &&
                  !!user.startSpeakingTime &&
                  secondsToDurationFormatLocale(user.speakingDurationTime)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  },
);

export default PCUserList;
