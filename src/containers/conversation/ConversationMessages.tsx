import { StarAnimation } from "@/components";
import { Message } from "@/features/messages/types";
import { useEffect, useRef, useState } from "react";

export type ConversationMessagesProps = {
  messages: Message[];
  renderMessage: (message: Message, index: number) => JSX.Element;
  languageRecorders: JSX.Element[];
  rotate180?: boolean;
  intructionText?: JSX.Element;
};

const ConversationMessages: React.FC<ConversationMessagesProps> = ({
  messages,
  renderMessage,
  languageRecorders,
  rotate180 = false,
  intructionText,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [firstLoad, setFirstLoad] = useState(false);

  useEffect(() => {
    if (!firstLoad) {
      setFirstLoad(true);
      if (parentRef.current) {
        parentRef.current.scrollTop = parentRef.current.scrollHeight;
      }
      return;
    }

    if (bottomRef?.current && firstLoad) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      className={`relative flex grow flex-col overflow-hidden ${rotate180 ? "rotate-180" : ""}`}
    >
      {messages.length > 0 ? (
        <div
          ref={parentRef}
          className="flex w-full grow flex-col gap-2 overflow-auto p-4"
        >
          {messages.map(renderMessage)}
          <div ref={bottomRef} />
        </div>
      ) : (
        <div className="relative flex w-full grow flex-col gap-2 p-4">
          {intructionText}
          {messages.length === 0 ? <StarAnimation /> : <></>}
        </div>
      )}

      <div className={`mt-4 flex w-full gap-2`}>
        {languageRecorders.map((item: any, index: number) => (
          <div className="h-full w-full" key={`recorder-${index}`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationMessages;
