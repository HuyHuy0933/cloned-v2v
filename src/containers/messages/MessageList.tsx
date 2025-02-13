import { IconButton } from "@/components";
import { ArrowDownIcon } from "@/components/icons";
import React, { ReactNode, useEffect, useRef, useState } from "react";

type MessageListProps<T> = {
  messages: T[];
  renderItem: (message: T, index: number) => ReactNode;
  onScroll?: (event: any) => void;
};

const MessageList: React.FC<MessageListProps<any>> = React.memo(
  <T,>({ messages, renderItem, onScroll }: MessageListProps<T>) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const isFirstLoad = useRef(true);

    useEffect(() => {
      const container = containerRef.current;

      const handleScroll = (event: any) => {
        onScroll && onScroll(event);
        if (!container) return;

        const isBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          50;

        if (isBottom) {
          setIsAtBottom(true);
          setShowScrollToBottom(false);
        } else {
          setIsAtBottom(false);
          setShowScrollToBottom(true);
        }
      };

      if (container) {
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
      }
    }, [onScroll]);

    useEffect(() => {
      if (!bottomRef.current) return;
      if (isFirstLoad.current) {
        // chatContainer.scrollTop = chatContainer.scrollHeight;
        bottomRef.current.scrollIntoView({ behavior: "instant" });
        isFirstLoad.current = false;
      } else if (isAtBottom) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages, isAtBottom]);

    const scrollToBottom = () => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
      setIsAtBottom(true);
      setShowScrollToBottom(false);
    };

    return (
      <>
        <div
          ref={containerRef}
          className="relative flex w-full grow flex-col gap-2 overflow-auto"
        >
          {messages.map((item: T, index: number) => renderItem(item, index))}
          <div ref={bottomRef} />
        </div>
        {showScrollToBottom && (
          <IconButton
            className="absolute bottom-14 right-0 z-10 size-10 rounded-full bg-[#078fb4] text-white hover:bg-[#21b2da]"
            onClick={scrollToBottom}
          >
            <ArrowDownIcon className="size-5" />
          </IconButton>
        )}
      </>
    );
  },
);

export default MessageList;
