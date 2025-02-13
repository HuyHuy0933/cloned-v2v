import {
  stringToBrightHexColor,
  getInitialsFromUsername,
  cn,
} from "@/lib/utils";
import React from "react";

type UserAvatarProps = {
  username: string;
  className?: string;
  hover?: boolean;
};

const UserAvatar: React.FC<UserAvatarProps> = React.memo(
  ({ username, className, hover }) => {
    const name = getInitialsFromUsername(username);
    const background = stringToBrightHexColor(
      username.length <= 2 ? `speaker_${username}` : username,
    );

    return (
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full text-xs text-white",
          className,
        )}
        style={{
          background: background,
          boxShadow: hover ? `0 0 12px 4px ${background}` : "",
        }}
      >
        {name}
      </span>
    );
  },
);

export { UserAvatar };
