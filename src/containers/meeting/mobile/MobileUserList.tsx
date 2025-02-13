import { WavingHandIcon } from "@/components/icons";
import { ComputedMeetingUser, MeetingUser } from "@/features/meeting/types";
import { allLanguages } from "@/lib/constaints";
import React, { useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/main";
import { meetingRoleOptions } from "../MeetingSetting";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { secondsToDurationFormatLocale } from "@/lib/datetime";
import TooltipUser from "./TooltipUser";

export const getIconByRole = (user: MeetingUser) => {
  const iconRole = meetingRoleOptions.find((x) => x.value === user.role);
  return iconRole?.icon;
};

type MobileUserListProps = {
  users: ComputedMeetingUser[];
  speakingUserId?: string;
  currentUserId?: string;
};

const MobileUserList: React.FC<MobileUserListProps> = React.memo(
  ({ users, speakingUserId, currentUserId }) => {
    const { t } = useTranslation();
    const showLargeRecorderBtn = useSelector(
      (state: RootState) => state.ui.metShowLgRecordBtn,
    );

    const [tooltipUserId, setTooltipUserId] = useState("");

    return (
      <div
        className={`flex ${showLargeRecorderBtn ? "h-[200px] overflow-hidden overflow-y-auto" : "h-[65px] grow flex-row items-end gap-0.5 overflow-x-auto whitespace-nowrap"} w-full`}
      >
        {showLargeRecorderBtn ? (
          <>
            <ul className="list-none">
              {users.map((user: ComputedMeetingUser) => (
                <li className="flex h-6 items-center gap-1" key={user.userId}>
                  <span className="mr-1 w-4 shrink-0">
                    {user.isNextSpeaker && (
                      <WavingHandIcon className="inline-block size-3 origin-[80%_100%] rotate-[17deg] animate-wave" />
                    )}
                  </span>
                  <span>{getIconByRole(user)}</span>
                  <img
                    src={
                      allLanguages.find((x) => x.code === user.language)
                        ?.flagUrl
                    }
                    alt="flag"
                    width={15}
                  />
                  <span
                    className={`flex h-full w-full items-center overflow-hidden text-ellipsis text-nowrap text-xs sm:text-sm ${
                      speakingUserId === user.userId
                        ? "bg-white text-black opacity-100"
                        : "opacity-70"
                    } ${user.isNextSpeaker ? "text-[#FFDC5D]" : ""}`}
                  >
                    {`${currentUserId === user.userId ? `(${t(tMessages.common.you())})` : ""} ${user.username}`}
                  </span>
                </li>
              ))}
            </ul>
            {/* <ul className="shrink-0 list-none">
              {users.map((user: ComputedMeetingUser) => (
                <li className="h-6" key={user.userId}>
                  <span
                    className={`flex h-full items-center pl-3 text-[10px] sm:text-xs ${
                      speakingUserId === user.userId
                        ? "bg-white text-black opacity-100"
                        : "opacity-70"
                    }`}
                  ></span>
                </li>
              ))}
            </ul> */}
          </>
        ) : (
          <>
            {users.map((user: ComputedMeetingUser) => (
              <div key={user.userId}>
                <div
                  className={`relative flex h-[48px] w-[48px] flex-col items-center justify-center p-2 ${user.userId === speakingUserId ? "bg-white" : ""}`}
                >
                  <TooltipUser user={user} />

                  <span className="absolute -top-[16px] w-full text-center text-[10px] text-white">
                    {user.speakingDurationTime !== undefined &&
                      !!user.startSpeakingTime &&
                      secondsToDurationFormatLocale(user.speakingDurationTime)}
                  </span>
                </div>
                {user.isNextSpeaker && (
                  <div className="mt-1 flex flex-col items-center">
                    <WavingHandIcon className="size-4 origin-[80%_100%] rotate-[17deg] animate-wave" />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    );
  },
);

export default MobileUserList;
