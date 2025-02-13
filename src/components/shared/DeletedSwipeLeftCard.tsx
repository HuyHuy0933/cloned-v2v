import { cn } from "@/lib/utils";
import React, { useState } from "react";
import {
  HTMLMotionProps,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import { DRAG_LEFT_CONSTRAINTS } from "@/lib/constaints";
import { IconButton } from "./IconButton";
import { TrashIcon } from "@radix-ui/react-icons";
import { ConfirmationModal } from "./ConfirmationModal";

interface DeletedSwipeLeftCardProps extends HTMLMotionProps<"div"> {
  onOpenDeleteModal?: () => void;
  onDelete: () => Promise<void>;
  title: string;
}

const DeletedSwipeLeftCard = React.forwardRef<
  HTMLDivElement,
  DeletedSwipeLeftCardProps
>(
  (
    {
      onOpenDeleteModal,
      onDelete,
      title,
      children,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const audioItemX = useMotionValue(0);
    const [trashIconOpacity, setTrashIconOpacity] = useState(0);
    const [open, setOpen] = useState(false);

    useMotionValueEvent(audioItemX, "change", (latest: number) => {
      setTrashIconOpacity(latest <= DRAG_LEFT_CONSTRAINTS ? 1 : 0);
    });

    const openDeleteConfirm = () => {
      setOpen(true);
      onOpenDeleteModal && onOpenDeleteModal();
    };

    const onDeleteConfirm = async () => {
      if (!onDelete) return;
      await onDelete();
      setOpen(false);
    };

    return (
      <div className="relative flex w-full items-center">
        <motion.div
          ref={ref}
          className={cn("", className)}
          style={{
            x: audioItemX,
            ...style,
          }}
          drag={"x"}
          dragConstraints={{ left: DRAG_LEFT_CONSTRAINTS, right: 0 }}
          dragElastic={0}
          {...props}
        >
          {children}
        </motion.div>

        {/* trash icon, show when swipe motion div to left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: trashIconOpacity }}
          transition={{ duration: 0.3 }}
          className="absolute right-0"
        >
          <IconButton
            className="size-10 rounded-full bg-red-500 hover:bg-red-400"
            onClick={openDeleteConfirm}
          >
            <TrashIcon className="size-8 text-white" />
          </IconButton>
        </motion.div>

        {/* Delete audio confirmation modal */}
        <ConfirmationModal
          open={open}
          onOpenChange={setOpen}
          onConfirm={onDeleteConfirm}
          onClose={() => setOpen(false)}
          title={title}
        />
      </div>
    );
  },
);

export { DeletedSwipeLeftCard };
