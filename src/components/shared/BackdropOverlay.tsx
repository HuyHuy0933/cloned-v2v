import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

type BackdropOverlayProps = {
  children?: ReactNode;
  className?: string
};

const BackdropOverlay: React.FC<BackdropOverlayProps> = React.memo(
  ({ children, className }) => {
    return (
      <div className={cn("absolute left-0 top-0 z-[9999] h-full w-full bg-black/50", className)}>
        {children}
      </div>
    );
  },
);

export { BackdropOverlay };
