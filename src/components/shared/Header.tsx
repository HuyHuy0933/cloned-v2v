import { cn } from "@/lib/utils";
import React from "react";
import { CircleCheckIcon } from "../icons";
import { tMessages } from "@/locales/messages";
import { useTranslation } from "react-i18next";
import { BlinkingDot } from "@/components";

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  centerItem?: string | JSX.Element;
  leftItem?: JSX.Element;
  rightItem?: JSX.Element;
  recording?: boolean;  
  completed?: boolean;
  centerClasses?: string;
  leftClasses?: string;
  rightClasses?: string
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  (
    {
      centerItem,
      leftItem = <div></div>,
      rightItem = <div></div>,
      recording = false,      
      completed = false,
      children,
      className,
      centerClasses,
      leftClasses,
      rightClasses,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    let center: any = centerItem;

    if (recording) {
      center = <BlinkingDot/>;
    }    

    if (completed) {
      center = (
        <>
          <CircleCheckIcon className="mr-2" />{" "}
          {t(tMessages.common.doneRecording())}
        </>
      );
    }
    return (
      <div
        className={cn(
          "relative flex min-h-[40px] w-full items-center justify-between",
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className={cn("absolute left-0 flex w-full items-center justify-center font-medium text-white", centerClasses)}>
          {center}
        </div>
        <div className={cn("z-10 flex", leftClasses)}>{leftItem}</div>
        <div className={cn("z-10 flex", rightClasses)}>{rightItem}</div>
      </div>
    );
  },
);

export { Header };
