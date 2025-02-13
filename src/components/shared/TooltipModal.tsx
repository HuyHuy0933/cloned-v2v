import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  IconButton,
} from "@/components";
import { QuestionMarkIcon } from "@/components/icons";
import { Cross1Icon } from '@radix-ui/react-icons';

export type TooltipModalProps = {
  className?: string,
  children?: ReactNode
}

const TooltipModal: React.FC<TooltipModalProps> = (
  {
    className,
    children
  }
) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton className={className}>
          <QuestionMarkIcon className="size-5 transition duration-200 hover:scale-[1.2]" />
        </IconButton>
      </DialogTrigger>
      <DialogContent className="sm:[70%] w-[90%] max-w-full border-none px-3 sm:px-6">
        <DialogHeader className="h-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="max-h-[80dvh] w-full overflow-auto text-justify text-sm text-white/80 sm:text-base">
          {children}
        </div>
        <DialogClose asChild>
          <IconButton type="button" className="absolute right-4 top-4">
            <Cross1Icon className="size-5" />
          </IconButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export { TooltipModal };
