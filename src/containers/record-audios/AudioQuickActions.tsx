import React, { useState } from "react";
import { StarIcon, Trash2Icon } from "lucide-react";
import { ConfirmationModal } from "@/components";

type AudioQuickActionsProps = {
  title: string;
  hideFavoriteBtn: boolean;
  onFavorite: () => Promise<void>;
  onDelete: () => Promise<void>;
  onOpenDeleteModal?: () => void;
};
const AudioQuickActions: React.FC<AudioQuickActionsProps> = ({
  title,
  hideFavoriteBtn,
  onOpenDeleteModal,
  onFavorite,
  onDelete,
}) => {

  const [open, setOpen] = useState(false);

  const stopPropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const onDoFavorite = async (event: React.MouseEvent) => {
    event.stopPropagation();
    await onFavorite();
  }

  const openDeleteConfirm = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen(true);
    onOpenDeleteModal && onOpenDeleteModal();
  };

  const onDeleteConfirm = async () => {      
    if (!onDelete) return;
    await onDelete();
    setOpen(false);    
  }; 

  return (
    <div
      className={`invisible absolute right-0 top-0 flex h-full items-center justify-end gap-2 p-2 z-[1000] transition-colors duration-150 group-hover:visible`}
    >
      {!hideFavoriteBtn && (
        <div 
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#333333] p-2 hover:text-alert-60"
          onClick={(event) => onDoFavorite(event)}>
          <StarIcon />
        </div>
      )}
      <div 
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#333333] p-2 hover:text-red-500"
        onClick={(event) => openDeleteConfirm(event)}
      >
        <Trash2Icon />
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
};

export default AudioQuickActions;
