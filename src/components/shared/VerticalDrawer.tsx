import React, { ReactNode, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { cn } from "@/lib/utils";

type VerticalDrawerProps = {
  className?: string
  open?: boolean;
  children: JSX.Element | JSX.Element[];
  title?: string;
  direction?: "top" | "bottom";
  onClose?: () => void;
  onOpenChange?: (value: boolean) => void;
  trigger?: ReactNode;
};

const VerticalDrawer: React.FC<VerticalDrawerProps> = ({
  open,
  onClose,
  title,
  children,
  direction = "bottom",
  onOpenChange,
  trigger,
  className
}) => {
  const [snap, setSnap] = useState<number | string | null>(0.4);

  const contentDirectionClass =
    direction === "top" ? "flex-col-reverse" : "flex-col";
  const contentRotateClass = direction === "top" ? "rotate-180" : "";

  const content = (
    <DrawerContent
      className={cn(`max-h-[50%] rounded-t-sm border-none bg-modal ${contentDirectionClass}`, className)}
    >
      <div
        className={`mx-auto w-full max-w-md overflow-auto ${contentRotateClass} px-4`}
      >
        <DrawerHeader className="flex p-0 pb-4">
          <DrawerTitle className="text-base font-medium text-white">
            {title}
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2 pb-4">{children}</div>
      </div>
    </DrawerContent>
  );

  if (direction === "top") {
    return (
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        onClose={onClose}
        direction={direction}
        snapPoints={[0.4]}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
      >
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      direction={direction}
      onOpenChange={onOpenChange}
    >
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      {content}
    </Drawer>
  );
};

export { VerticalDrawer };
