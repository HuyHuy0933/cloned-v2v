import { cva, type VariantProps } from "class-variance-authority";
import {
  FieldError as AriaFieldError,
  FieldErrorProps as AriaFieldErrorProps,
  Group as AriaGroup,
  GroupProps as AriaGroupProps,
  Label as AriaLabel,
  LabelProps as AriaLabelProps,
  Text as AriaText,
  TextProps as AriaTextProps,
  composeRenderProps,
} from "react-aria-components";

import { cn } from "@/lib/utils";

const jollyLabelVariants = cva([
  "text-sm font-medium leading-none",
  /* Disabled */
  "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
  /* Invalid */
  "group-data-[invalid]:text-destructive",
]);

const JollyLabel = ({ className, ...props }: AriaLabelProps) => (
  <AriaLabel className={cn(jollyLabelVariants(), className)} {...props} />
);

function JollyFormDescription({ className, ...props }: AriaTextProps) {
  return (
    <AriaText
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
      slot="description"
    />
  );
}

function JollyFieldError({ className, ...props }: AriaFieldErrorProps) {
  return (
    <AriaFieldError
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    />
  );
}

const jollyFieldGroupVariants = cva("", {
  variants: {
    variant: {
      default: [
        "relative flex h-9 w-full items-center overflow-hidden rounded-md border border-primary-foreground bg-background px-3 py-2 text-sm ring-offset-background",
        /* Focus Within */
        "data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring data-[focus-within]:ring-offset-2",
        /* Disabled */
        "data-[disabled]:opacity-50",
      ],
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface JollyGroupProps
  extends AriaGroupProps,
    VariantProps<typeof jollyFieldGroupVariants> {}

function JollyFieldGroup({ className, variant, ...props }: JollyGroupProps) {
  return (
    <AriaGroup
      className={composeRenderProps(className, (className) =>
        cn(jollyFieldGroupVariants({ variant }), className),
      )}
      {...props}
    />
  );
}

export {
  JollyLabel,
  jollyLabelVariants,
  JollyFieldGroup,
  jollyFieldGroupVariants,
  JollyFieldError,
  JollyFormDescription,
};
