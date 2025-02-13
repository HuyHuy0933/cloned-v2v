import { Button, Input } from "@/components";
import React from "react";

type MessageInputProps = {
  value: string;
  onChange: string;
  onSubmit: (value: string) => void
  className?: string
}

const MessageInput: React.FC<MessageInputProps> = ({

}) => {
  return (
    <div className="absolute bottom-1 flex w-full gap-2">
      <Input
        className="w-full border border-primary-foreground focus-visible:ring-0"
        placeholder="Type your message"
      />
      <Button className="h-fit rounded-sm">Send</Button>
    </div>
  );
};

export default MessageInput;
