import { ReactNode } from "react";
import { Toast, ToastClose, ToastProvider, ToastViewport } from "../ui/toast";

type StatusToastProps = {
  variant?: "alert" | "default" | "destructive";
  children?: ReactNode;
  duration?: number;
  className?: string
};

const StatusToast: React.FC<StatusToastProps> = ({
  variant = "default",
  children,
  duration = 3000,
  className
}) => {
  return (
    <ToastProvider duration={duration}>
      <Toast variant={variant} className={className}>
        {children}
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
};

export { StatusToast };
