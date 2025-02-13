import {
  Button,
  CustomFileUpload,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  IconButton,
  Spinner,
} from "@/components";
import { UploadAttachmentRequest } from "@/features/record-audios/types";
import { useUploadAttachmentMutation } from "@/features/recording-meeting/mutations";
import { catchError } from "@/lib/trycatch";
import { getFileExtensionFromUrl } from "@/lib/utils";
import { tMessages } from "@/locales/messages";
import { Cross2Icon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

type AttachmentUploadModalProps = {
  audioId: string;
};

const AttachmentUploadModal: React.FC<AttachmentUploadModalProps> = React.memo(
  ({ audioId }) => {
    const { t } = useTranslation();
    const uploadAttachmentMutation = useUploadAttachmentMutation();

    const [uploadFile, setUploadFile] = useState<File | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<boolean>(false);

    const handleFileChange = useCallback((file: File | undefined) => {
      if (file) {
        setUploadFile(file);
        setError(false);
      } else {
        removeFile();
      }
    }, []);

    const removeFile = useCallback(() => {
      setUploadFile(undefined);
      setError(false);
    }, []);

    const uploadAttachment = async () => {
      if (!uploadFile) return;

      setUploading(true);
      const dateTime = new Date().getTime();
      const extension = getFileExtensionFromUrl(uploadFile.name);
      const payload: UploadAttachmentRequest = {
        file: uploadFile,
        name: uploadFile.name,
        size: uploadFile.size,
        datetime: dateTime,
        audio_id: audioId,
      };

      const [error, result] = await catchError(
        uploadAttachmentMutation.mutateAsync(payload),
      );
      setUploading(false);
      if (error) {
        console.log("error", error);
        setError(true);
        return;
      }

      setUploadFile(undefined)
      setOpen(false);
    };

    return (
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) {
            removeFile();
          }
        }}
      >
        <DialogTrigger asChild>
          <IconButton className="flex-col rounded-full bg-primary p-2 text-white hover:bg-primary-foreground">
            <Cross2Icon className="size-4 rotate-45 font-bold" />
          </IconButton>
        </DialogTrigger>
        <DialogContent className="w-[90%] max-w-xl p-3 sm:p-6 md:w-[700px] md:max-w-xl">
          <DialogHeader className="hidden">
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div className="relative flex w-full flex-col items-center justify-center space-x-2 rounded-lg bg-[#1A1A1A] p-3">
            <CustomFileUpload
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
              placeholder={t(tMessages.common.uploadAttachmentPlaceholder())}
              maxFileSize={100}
              maxFileSizeText={t(tMessages.common.fileSizeLimit(), {
                size: 100,
              })}
            />
            {uploadFile && (
              <Button
                className="mt-4 w-[150px] rounded-xl py-2"
                onClick={uploadAttachment}
                disabled={uploading || !uploadFile}
              >
                {uploading ? (
                  <Spinner className="size-4" />
                ) : (
                  t(tMessages.common.upload())
                )}
              </Button>
            )}

            {error && (
              <p className="mt-2 text-red-500">
                {t(tMessages.common.failToUpload())}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

export default AttachmentUploadModal;
