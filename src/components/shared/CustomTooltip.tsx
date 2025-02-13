import React, { ReactNode, useState } from "react";
import { QuestionMarkIcon } from "../icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { isDesktop } from "@/lib/constaints";
import { cn } from "@/lib/utils";

type CustomTooltipProps = {
  children: ReactNode;
  trigger?: ReactNode;
  className?: string;
};

const CustomTooltip: React.FC<CustomTooltipProps> = React.memo(
  ({ children, trigger, className }) => {
    const [open, setOpen] = useState(false);

    if (!isDesktop) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip open={open}>
            <TooltipTrigger asChild>
              <div
                onTouchStart={() => setOpen(true)}
                onMouseLeave={() => setTimeout(() => setOpen(false), 200)}
              >
                {trigger || <QuestionMarkIcon className="size-5 transition duration-200 hover:scale-[1.2]" />}
              </div>
            </TooltipTrigger>
            <TooltipContent className={cn("w-80 bg-background text-xs sm:text-sm text-white", className)}>
              {children}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{trigger || <QuestionMarkIcon className="size-5 transition duration-200 hover:scale-[1.2]" />}</div>
          </TooltipTrigger>
          <TooltipContent className={cn("w-80 bg-background text-xs sm:text-sm text-white", className)}>
            {children}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

export { CustomTooltip };
