import React from "react";
import { Button, ButtonProps } from "../ui/button";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends ButtonProps {}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        className={cn(
          "bg-transparent p-0 shadow-none hover:bg-transparent",
          className,
        )}
        {...props}
        ref={ref}
      >
        {props.children}
      </Button>
    );
  },
);

export { IconButton };
