import { Button, Separator, UserAvatar } from "@/components";
import { MeetingRoom, MeetingUser } from "@/features/meeting/types";
import { milisDiffFromStartToCurrent, milisToTimer } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "./styles/GlowStyle.scss";
import { Password, TeamsIcon } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

type MeetingItemProps = {
  meeting: MeetingRoom;
  onClick?: (meeting: MeetingRoom) => void;
  selected?: boolean;
  className?: string;
};

const MeetingItem: React.FC<MeetingItemProps> = ({
  meeting,
  onClick,
  selected = false,
  className,
}) => {
  const { t } = useTranslation();
  const [duration, setDuration] = useState(() =>
    milisDiffFromStartToCurrent(meeting.createdAt),
  ); // miliseconds
  const [showJoinText, setShowJoinText] = useState(false); // this state used for mobile, tablet devices
  const meetingDurInterval = useRef<any>(null);

  const isTeamsMeeting = meeting.bot_url && meeting.bot_url.includes("teams");
  const botId = `bot_${meeting.meetingId}` 

  useEffect(() => {
    const updateDuration = () => {
      setDuration((prev) => prev + 1000);
    };

    meetingDurInterval.current = setInterval(updateDuration, 1000);
    return () => {
      if (meetingDurInterval.current) {
        clearInterval(meetingDurInterval.current);
      }
    };
  }, []);

  const meetingInfo = (
    <>
      <p className="text-lg font-bold underline underline-offset-4">
        {meeting.meetingName}
      </p>
      {meeting.users && (
        <ul className="mb-4 mt-4 grow text-lg">
          {meeting.users.map((user: MeetingUser) => (
            <li key={user.userId} className="flex items-center gap-2 text-sm">
              {user.userId === botId ? (
                <TeamsIcon />
              ) : (
                <UserAvatar username={user.username} />
              )}
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (!selected) {
    return (
      <div
        className={cn(
          "meeting-box glow relative min-h-[150px] w-full rounded-xl border-2 border-white/50 bg-transparent p-2 hover:border-white",
          className,
        )}
      >
        { isTeamsMeeting && <TeamsIcon className="absolute left-2 top-2" /> }
        { meeting.isProtected && <Password className="absolute right-2 top-2 h-5 w-5 fill-gray-300" /> }
        <div
          className="flex h-full w-full flex-col items-center justify-center p-4"
          onClick={() => onClick && onClick(meeting)}
        >
          {meetingInfo}
        </div>
        {meeting.users && (
          <div className="absolute bottom-2 right-2 flex flex-col items-end text-xs tracking-wider text-primary-foreground">
            <p>{milisToTimer(duration)}</p>
            <p>
              {t(tMessages.common.meetingParticipants(), {
                number: meeting.users.length,
              })}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "meeting-box glow group relative min-h-[150px] w-full overflow-hidden rounded-xl border-2 border-white bg-transparent",
        className,
      )}
    >
      { isTeamsMeeting && <TeamsIcon className="absolute left-2 top-2" /> }
      { meeting.isProtected && <Password className="absolute right-2 top-2 h-5 w-5 fill-gray-300" /> }
        
      <div
        className="flex h-full w-full flex-col items-center justify-center p-4 transition-all duration-300 md:group-hover:-translate-y-full"
        onClick={() => setShowJoinText(true)}
        style={{ transform: showJoinText ? "translateY(-100%)" : "" }}
      >
        {meetingInfo}
      </div>

      <Button
        className="absolute left-0 top-full flex h-full w-full gap-2 bg-transparent text-lg transition-all duration-300 hover:bg-transparent md:group-hover:top-[0%]"
        style={{ top: showJoinText ? "0%" : "" }}
        type="submit"
      >
        <Separator />
        {t(tMessages.common.joinMeeting())}
        <Separator />
      </Button>

      {meeting.users && (
        <div className="absolute bottom-2 right-2 flex flex-col items-end text-xs tracking-wider text-primary-foreground">
          <p>{milisToTimer(duration)}</p>
          <p>
            {t(tMessages.common.meetingParticipants(), {
              number: meeting.users.length,
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default MeetingItem;
