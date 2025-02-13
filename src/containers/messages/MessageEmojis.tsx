import { MessageEmoji } from "@/features/messages/types";
import { emojiMap } from "@/lib/constaints";
import { cn } from "@/lib/utils";
import React from "react";

type MessageEmojisProps = {
  emojis: MessageEmoji[];
  className?: string;
  emojiItemClasses?: string;
  onClickEmoji: (emoji: string) => void;
};

const MessageEmojis: React.FC<MessageEmojisProps> = React.memo(
  ({ emojis, className, emojiItemClasses, onClickEmoji }) => {
    return (
      <div className={cn("flex w-full flex-wrap gap-2", className)}>
        {emojis.map((item: MessageEmoji) => (
          <div
            key={item.name}
            className={cn(
              "rounded-lg bg-neutral-600 px-1 py-0.5 text-sm hover:bg-neutral-700",
              emojiItemClasses,
            )}
            onClick={() => onClickEmoji && onClickEmoji(item.name)}
          >
            {emojiMap[item.name]} {item.userIds.length}
          </div>
        ))}
      </div>
    );
  },
);

export default MessageEmojis;
