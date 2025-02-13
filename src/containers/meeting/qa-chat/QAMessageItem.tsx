import { UserAvatar } from "@/components";
import { QAMessage } from "@/features/qa-messages/types";
import { cn } from "@/lib/utils";
import { tMessages } from "@/locales/messages";
import React from "react";
import { useTranslation } from "react-i18next";

type QAMessageItemProps = {
  message: QAMessage;
  isYou?: boolean;
  className?: string;
};

const QAMessageItem: React.FC<QAMessageItemProps> = ({
  message,
  className,
  isYou,
}) => {
  const { t } = useTranslation();
  return (
    <div className={cn("text-sm text-white", className)}>
      <div className="flex w-full items-center gap-2">
        <UserAvatar className="shrink-0" username={message.username} />
        <p className="text-sm text-white">{message.username}</p>
        {isYou && <p>({t(tMessages.common.you())})</p>}
      </div>
      <p className="mt-1 text-sm text-white">{message.text}</p>
    </div>
  );
};

export default QAMessageItem;
