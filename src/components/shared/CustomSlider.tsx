import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

type CustomSliderProps = React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> & {
  displayedValue?: string;
};

const CustomSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  CustomSliderProps
>(({ className, value, displayedValue, ...props }, ref) => {
  const output = displayedValue || "";

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/20">
        <SliderPrimitive.Range className="absolute h-full bg-white" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="border-thumb/50 bg-thumb relative block h-4 w-4 rounded-full border shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
        <span className="absolute -top-6 left-0 text-xs">{output}</span>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});

export { CustomSlider };
