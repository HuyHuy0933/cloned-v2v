import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

export type ConfirmationModalProps = {
  open?: boolean;
  title?: string;
  children?: ReactNode;
  onConfirm?: () => void | Promise<void>;
  onClose?: () => void;
  onOpenChange?: (value: boolean) => void;
  confirmTitle?: string;
  closeTitle?: string;
  confirmButton?: ReactNode;
  confirmClasses?: string;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = (props) => {
  const { t } = useTranslation();
  const {
    children,
    onConfirm,
    onClose,
    open,
    title,
    confirmTitle = t(tMessages.common.yes()),
    closeTitle = t(tMessages.common.no()),
    confirmButton,
    confirmClasses,
    onOpenChange,
  } = props;
  const [loading, setLoading] = useState(false);
  if (children) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90%] max-w-xl md:w-[700px] md:max-w-xl">
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  const confirm = async () => {
    if (!onConfirm) return;
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-xl md:w-[700px] md:max-w-xl">
        {title && (
          <DialogHeader>
            <DialogTitle className="w-full text-start leading-6 text-white">
              {title}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
        )}
        <div className="flex justify-end gap-2">
          <Button
            className="border bg-transparent"
            onClick={onClose}
            disabled={loading}
          >
            {closeTitle}
          </Button>
          {confirmButton ? (
            confirmButton
          ) : (
            <Button
              className={cn("bg-red-500 hover:bg-red-400", confirmClasses)}
              onClick={confirm}
              disabled={loading}
            >
              {loading ? <Spinner className="size-4" /> : confirmTitle}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ConfirmationModal };
