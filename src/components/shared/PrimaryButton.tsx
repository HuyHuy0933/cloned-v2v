import React, { ReactNode } from "react";
import { Button, ButtonProps } from "../ui/button";
import { cn } from "@/lib/utils";

export interface PrimayButtonProps extends ButtonProps {
  prependIcon?: ReactNode;
  appendIcon?: ReactNode;
  childClass?: string;
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimayButtonProps>(
  ({ prependIcon, appendIcon, className, childClass = "", ...props }, ref) => {
    return (
      <Button
        className={cn(
          "h-[52px] w-full gap-4 rounded-2xl bg-primary font-medium text-white hover:bg-primary-foreground",
          className,
        )}
        {...props}
        ref={ref}
      >
        {prependIcon}
        <div
          className={cn(
            "flex shrink grow items-center gap-2 text-wrap text-start font-medium",
            childClass,
          )}
        >
          {props.children}
        </div>
        {appendIcon}
      </Button>
    );
  },
);

export { PrimaryButton };
