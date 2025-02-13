import { UserAvatar } from "@/components";
import { ReplyMessage } from "@/features/messages/types";
import { timeAgo } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { tMessages } from "@/locales/messages";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type MessageReplies = {
  replies: ReplyMessage[];
  className?: string;
  onClick: () => void;
  layout?: string;
};

const MessageReplies: React.FC<MessageReplies> = React.memo(
  ({ replies, className, onClick, layout = "mobile" }) => {
    const { t } = useTranslation();
    const [formattedLastReply, setFormattedLastReply] = useState("");

    const lastReply = useMemo(() => {
      return Array.from(replies).sort((a, b) => b.createdAt - a.createdAt)[0];
    }, [replies]);

    useEffect(() => {
      setFormattedLastReply(timeAgo(lastReply.createdAt));

      const inteval = setInterval(() => {
        setFormattedLastReply(timeAgo(lastReply.createdAt));
      }, 60 * 1000);

      return () => {
        clearInterval(inteval);
      };
    }, [lastReply]);

    const repliesUsers = useMemo(() => {
      const uniqueUsers = [];
      const userIds = new Set();

      for (const message of replies) {
        if (!userIds.has(message.userId)) {
          userIds.add(message.userId);
          uniqueUsers.push(message);
        }
        if (uniqueUsers.length === 5) break;
      }

      return uniqueUsers;
    }, [replies]);

    return (
      <div
        className={cn("flex items-center gap-2", className)}
        onClick={onClick}
      >
        <div className="flex gap-1">
          {repliesUsers.map((x) => (
            <UserAvatar
              key={x.userId}
              className="size-5 text-[10px]"
              username={x.username}
            />
          ))}
        </div>

        <p className="border-b-[0.5px] text-[12px]">
          <span className="text-[#2EA3FF]">{replies.length} {t(tMessages.common.replies())}</span>
          <span
            className={`ml-2 ${layout === "mobile" ? "text-primary-foreground" : "text-gray-52"}`}
          >
            {t(tMessages.common.lastReply())}: {formattedLastReply}
          </span>
        </p>
      </div>
    );
  },
);

export default MessageReplies;
