import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";

type CustomTabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsTrigger
>;

const CustomTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsTrigger>,
  CustomTabsTriggerProps
>(({ className, ...props }, ref) => {
  return (
    <TabsTrigger
      ref={ref}
      className={cn(
        "rounded-none border-b-[3px] border-transparent px-[2px] sm:p-1 py-2 text-[10px] transition-colors duration-700 ease-in-out hover:border-b-white hover:bg-[#333] hover:ease-in-out data-[state=active]:border-[1px] data-[state=active]:border-b-[3px] data-[state=active]:border-neutral-700 data-[state=active]:border-b-white data-[state=active]:bg-[#333] data-[state=active]:font-semibold sm:text-sm sm:py-[10px]",
        className,
      )}
      {...props}
    />
  );
});

export { CustomTabsTrigger };
