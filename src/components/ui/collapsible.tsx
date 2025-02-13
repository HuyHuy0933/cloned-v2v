import { cn } from "@/lib/utils";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import React from "react";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    ref={ref}
    className={cn("", className)}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.CollapsibleTrigger>
));

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    className={cn(
      "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
      className,
    )}
    {...props}
  />
));

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
