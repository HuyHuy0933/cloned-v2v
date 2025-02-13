import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  UserAvatar,
} from "@/components";
import { ComputedMeetingUser } from "@/features/meeting/types";
import React, { useState } from "react";
import { getIconByRole } from "./MobileUserList";
import { isDesktop } from "@/lib/constaints";

type TooltipUserProps = {
  user: ComputedMeetingUser;
};

const TooltipUser: React.FC<TooltipUserProps> = React.memo(({ user }) => {
  const [open, setOpen] = useState(false);

  const userInfo = (
    <>
      <UserAvatar className="size-8" username={user.username} />
      <span className="absolute bottom-0 right-0">{getIconByRole(user)}</span>
    </>
  );

  if (!isDesktop) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip open={open}>
          <TooltipTrigger asChild>
            <div
              className="flex flex-col items-center"
              onTouchStart={() => setOpen(true)}
              onMouseLeave={() => setTimeout(() => setOpen(false), 200)}
            >
              {userInfo}
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-modal">
            <p className="text-sm text-white">{user.username}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center">{userInfo}</div>
        </TooltipTrigger>
        <TooltipContent className="bg-modal">
          <p className="text-sm text-white">{user.username}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export default TooltipUser;
