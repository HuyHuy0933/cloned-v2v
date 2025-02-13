import React, { useCallback, useEffect, useRef } from "react";
import { Textarea, TextareaProps } from "@/components";

type AutoHeightInputProps = TextareaProps & {
  onEnterSubmit?: () => void;
};

const AutoHeightInput = React.forwardRef<
  HTMLTextAreaElement,
  AutoHeightInputProps
>(({ className, value = "", onChange, onEnterSubmit, ...props }, ref) => {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const combinedRef = (instance: HTMLTextAreaElement) => {
    internalRef.current = instance;
    if (typeof ref === "function") {
      ref(instance);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLTextAreaElement>).current = instance;
    }
  };

  useEffect(() => {
    // Auto resize height based on content
    if (internalRef.current && typeof value === "string" && value.length > 0) {
      internalRef.current.style.height = "auto";
      internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
    }
  }, [value]);

  const onKeyDown = useCallback(
    (event: any) => {
      if (event.keyCode === 13 && !event.shiftKey && onEnterSubmit) {
        event.preventDefault();
        onEnterSubmit();
      }
    },
    [onEnterSubmit],
  );

  return (
    <Textarea
      ref={combinedRef}
      className={className}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      {...props}
    />
  );
});

export { AutoHeightInput };
