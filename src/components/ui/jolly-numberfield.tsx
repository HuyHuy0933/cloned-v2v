import {
  ButtonProps as AriaButtonProps,
  Input as AriaInput,
  InputProps as AriaInputProps,
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
  ValidationResult as AriaValidationResult,
  composeRenderProps,
  Text,
} from "react-aria-components"

import { cn } from "@/lib/utils"

import { JollyFieldError, JollyFieldGroup, JollyLabel } from "./jolly-field"
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { JollyButton } from "./jolly-button"

const JollyNumberField = AriaNumberField

function JollyNumberFieldInput({ className, ...props }: AriaInputProps) {
  return (
    <AriaInput
      className={composeRenderProps(className, (className) =>
        cn(
          "w-fit min-w-0 flex-1 border-r border-transparent bg-transparent pr-2 outline outline-0 placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
          className
        )
      )}
      {...props}
    />
  )
}

function JollyNumberFieldSteppers({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute right-0 flex h-full flex-col border-l border-primary-foreground",
        className
      )}
      {...props}
    >
      <NumberFieldStepper slot="increment">
        <ChevronUpIcon aria-hidden className="size-4" />
      </NumberFieldStepper>
      <div className="border-b border-primary-foreground" />
      <NumberFieldStepper slot="decrement">
        <ChevronDownIcon aria-hidden className="size-4" />
      </NumberFieldStepper>
    </div>
  )
}

function NumberFieldStepper({ className, ...props }: AriaButtonProps) {
  return (
    <JollyButton
      className={composeRenderProps(className, (className) =>
        cn("w-auto grow rounded-none px-0.5", className)
      )}
      variant={"default"}
      size={"icon"}
      {...props}
    />
  )
}

interface JollyNumberFieldGroupProps extends AriaNumberFieldProps {
  label?: string
  description?: string
  errorMessage?: string | ((validation: AriaValidationResult) => string)
}

function JollyNumberFieldGroup({
  label,
  description,
  errorMessage,
  className,
  ...props
}: JollyNumberFieldGroupProps) {
  return (
    <JollyNumberField
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className)
      )}
      {...props}
    >
      <JollyLabel>{label}</JollyLabel>
      <JollyFieldGroup>
        <JollyNumberFieldInput />
        <JollyNumberFieldSteppers />
      </JollyFieldGroup>
      {description && (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      )}
      <JollyFieldError>{errorMessage}</JollyFieldError>
    </JollyNumberField>
  )
}

export {
  JollyNumberField,
  JollyNumberFieldInput,
  JollyNumberFieldSteppers,
  NumberFieldStepper,
  JollyNumberFieldGroup,
}
export type { JollyNumberFieldGroupProps }
