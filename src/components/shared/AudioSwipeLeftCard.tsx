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
import { isDesktop, LOCAL_STORAGE_KEY } from "@/lib/constaints";
import {
  AUDIO_STATUS_ENUM,
  RecordedAudio,
} from "@/features/record-audios/types";

interface AudioSwipeLeftCardProps extends HTMLMotionProps<"div"> {
  onOpenDeleteModal?: () => void;
  onDelete: () => Promise<void>;
  onFavorite: () => Promise<void>;
  title: string;
  isChildAudio: boolean;
  audio: RecordedAudio;
}

const AudioSwipeLeftCard = React.forwardRef<
  HTMLDivElement,
  AudioSwipeLeftCardProps
>(
  (
    {
      onOpenDeleteModal,
      onDelete,
      onFavorite,
      isChildAudio,
      audio,
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

    const userId = localStorage.getItem(LOCAL_STORAGE_KEY.user_id);
    const isFavorite =
      !!userId && audio.favorite && audio.favorite.includes(userId);
    const onMobile = isChildAudio && !isDesktop;
    const isUploaded = audio.status === AUDIO_STATUS_ENUM.UPLOADED;

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
      <div
        className={`group relative flex w-full ${isDesktop && audio.status !== AUDIO_STATUS_ENUM.UPLOADING ? "hover:rounded-2xl hover:bg-[#555555]" : ""} items-center justify-center transition-colors duration-300`}
      >
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
        <div
          className={`absolute right-0 z-[99] flex h-full ${!isChildAudio ? "mr-2" : ""} ${isDesktop ? "invisible flex-row items-center justify-end rounded-r-2xl group-hover:visible" : "flex-col items-end justify-center"} gap-2`}
        >
          {isUploaded && (
            <motion.div
              initial={{ opacity: isDesktop ? 1 : 0 }}
              animate={{ opacity: isDesktop ? 1 : favoriteIconOpacity }}
              transition={{ duration: 0.3 }}
            >
              <IconButton
                className={`size-8 rounded-full text-white hover:text-[#ffd700] ${onMobile ? "bg-primary hover:bg-primary" : "bg-[#333333] hover:bg-[#333333]"}`}
                onClick={doFovorite}
              >
                {isFavorite ? (
                  <Star className="size-4 text-[#ffd700]" fill="#ffd700" />
                ) : (
                  <Star className="size-4" />
                )}
              </IconButton>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: isDesktop ? 1 : 0 }}
            animate={{ opacity: isDesktop ? 1 : trashIconOpacity }}
            transition={{ duration: 0.3 }}
            className={`${isDesktop ? "mr-2" : ""}`}
          >
            <IconButton
              className={`size-8 rounded-full text-white hover:text-red-500 ${onMobile ? "bg-primary hover:bg-primary" : "bg-[#333333] hover:bg-[#333333]"}`}
              onClick={openDeleteConfirm}
            >
              <Trash2Icon className="size-4" />
            </IconButton>
          </motion.div>
        </div>

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

export { AudioSwipeLeftCard };
