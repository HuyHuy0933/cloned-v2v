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
import { ConfirmationModal } from "./ConfirmationModal";
import { Star, Trash2Icon } from "lucide-react";

interface AudioDeleteSwipeLeftCardProps extends HTMLMotionProps<"div"> {
  onOpenDeleteModal?: () => void;
  onDelete: () => Promise<void>;
  onFavorite: () => Promise<void>;
  title: string;
  hideFavoriteBtn: boolean;
  isChildAudio: boolean;
}

const AudioDeleteSwipeLeftCard = React.forwardRef<
  HTMLDivElement,
  AudioDeleteSwipeLeftCardProps
>(
  (
    {
      onOpenDeleteModal,
      onDelete,
      onFavorite,
      hideFavoriteBtn,
      isChildAudio,
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
    const [favoriteIconOpacity, setFavoriteIconOpacity] = useState(0);
    const [open, setOpen] = useState(false);

    useMotionValueEvent(audioItemX, "change", (latest: number) => {
      setTrashIconOpacity(latest <= DRAG_LEFT_CONSTRAINTS ? 1 : 0);
      setFavoriteIconOpacity(latest <= DRAG_LEFT_CONSTRAINTS ? 1 : 0);
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

    const doFovorite = async () => {
      await onFavorite();
    };

    return (
      <div className="relative flex w-full flex-col items-center">
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

        {/* trash icon, star icon, show when swipe motion div to left */}
        {!hideFavoriteBtn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: favoriteIconOpacity }}
            transition={{ duration: 0.3 }}
            className="absolute right-1 top-2"
          >
            <IconButton
              className={`size-8 rounded-full ${isChildAudio ? "bg-primary hover:bg-primary" : "bg-[#333333] hover:bg-[#333333]"}`}
              onClick={doFovorite}
            >
              <Star className="size-4 text-white hover:text-alert-60" />
            </IconButton>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: trashIconOpacity }}
          transition={{ duration: 0.3 }}
          className={`absolute right-1 ${hideFavoriteBtn ? "top-8" : "top-12"} `}
        >
          <IconButton
            className={`size-8 rounded-full ${isChildAudio ? "bg-primary hover:bg-primary" : "bg-[#333333] hover:bg-[#333333]"}`}
            onClick={openDeleteConfirm}
          >
            <Trash2Icon className="size-4 text-white hover:text-red-500" />
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

export { AudioDeleteSwipeLeftCard };
