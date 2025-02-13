import {
  AutoHeightInput,
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components";
import MessageItem from "@/containers/messages/MessageItem";
import MessageList from "@/containers/messages/MessageList";
import PCMessageItem from "@/containers/messages/PCMessageItem";
import { Message } from "@/features/messages/types";
import { tMessages } from "@/locales/messages";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

type MobileReplyMessagesProp = {
  open: boolean;
  onOpenChange?: (value: boolean) => void;
  onReplyMessage?: (text: string) => void;
  message: Message;
  currentUserId: string;
  layout?: string;
};

const ReplyMessagesChat: React.FC<MobileReplyMessagesProp> = React.memo(
  ({
    open,
    onOpenChange,
    onReplyMessage,
    message,
    currentUserId,
    layout = "mobile",
  }) => {
    const { t } = useTranslation();
    const inputRef = useRef<any>(null);
    const [text, setText] = useState("");

    const sendMessage = useCallback(() => {
      onReplyMessage && onReplyMessage(text);
      setText("");
    }, [onReplyMessage, text]);

    const messages = useMemo(() => {
      const clone: Message = {...message, emojis: undefined, replies: undefined, centerData: undefined};
      let result = [clone];

      if (message.replies) {
        result.push(...message.replies);
      }

      return result;
    }, [message, message.replies]);

    const isPCLayout = layout === "pc";

    if (isPCLayout)
      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent className="flex w-[80%] flex-col bg-gray-97 p-4 sm:max-w-none">
            <SheetHeader>
              <SheetTitle className="text-left text-black">
                {t(tMessages.common.thread())}
              </SheetTitle>
              <SheetDescription></SheetDescription>
            </SheetHeader>

            <div className="relative mb-16 flex h-full w-full flex-col gap-2 overflow-y-auto">
              {/* Messages */}
              <MessageList
                messages={messages}
                renderItem={(msg: Message) => (
                  <PCMessageItem
                    className="min-h-[40px]"
                    key={msg.id}
                    message={msg}
                    hideTranslated={true}
                    hideVolume={true}
                  />
                )}
              />
            </div>

            {/* Input */}
            <div className="absolute bottom-4 left-0 flex w-full items-end gap-2 px-4">
              <AutoHeightInput
                className="h-6 max-h-16 w-full border border-gray-92 text-gray-52 focus-visible:ring-0"
                rows={1}
                placeholder={t(tMessages.common.enterMsgPlaceholder())}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onEnterSubmit={sendMessage}
              />
              <Button
                className="h-fit rounded-sm bg-gradient-lime-100 text-black hover:shadow-md"
                onClick={sendMessage}
              >
                {t(tMessages.common.send())}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      );

    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-[80%] flex-col bg-background p-4 py-6 text-white sm:max-w-none">
          <SheetHeader>
            <SheetTitle className="text-left text-white">
              {t(tMessages.common.thread())}
            </SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>

          <div className="relative mb-16 flex h-full w-full flex-col gap-2 overflow-y-auto">
            {/* Messages */}
            <MessageList
              messages={messages}
              renderItem={(msg: Message) => (
                <MessageItem
                  key={msg.id}
                  className={`w-auto max-w-[80%] ${msg.userId === currentUserId ? "self-end" : "self-start"}`}
                  message={msg}
                  currentUserId={currentUserId}
                  hideTranslated={true}
                  hideVolume={true}
                />
              )}
            />
          </div>

          {/* Input */}
          <div className="absolute bottom-4 left-0 flex w-full items-end gap-2 px-4">
            <AutoHeightInput
              ref={inputRef}
              className="h-6 max-h-16 w-full border border-primary-foreground focus-visible:ring-0"
              rows={1}
              placeholder={t(tMessages.common.enterMsgPlaceholder())}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onEnterSubmit={sendMessage}
            />
            <Button className="h-fit rounded-sm" onClick={sendMessage}>
              {t(tMessages.common.send())}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

export default ReplyMessagesChat;
