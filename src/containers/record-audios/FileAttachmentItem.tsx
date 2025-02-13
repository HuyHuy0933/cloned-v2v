import { CircularProgress, ConfirmationModal, IconButton } from "@/components";
import { generateAudioPresignUrl } from "@/features/record-audios/queries";
import { FileAttachment } from "@/features/record-audios/types";
import { useDeleteAttachmentMutation } from "@/features/recording-meeting/mutations";
import { useCurrentUser } from "@/hooks";
import { DEFAULT_STALE_TIME_QUERY, QUERY_KEY } from "@/lib/constaints";
import { formatDateTimeLocale } from "@/lib/datetime";
import { catchError } from "@/lib/trycatch";
import { downloadMediaFileURL, formatFileSize } from "@/lib/utils";
import { tMessages } from "@/locales/messages";
import { DownloadIcon, FileIcon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { fromUnixTime } from "date-fns";
import { Trash2Icon } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type FileAttachmentItemProps = {
  attachment: FileAttachment;
  audioId: string;
};

const FileAttachmentItem: React.FC<FileAttachmentItemProps> = React.memo(
  ({ attachment, audioId }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { setting: userSetting } = useCurrentUser();

    const deleteAttachmentMutation = useDeleteAttachmentMutation();

    const [deleted, setDeleted] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const downloadAttachment = async (attachment: FileAttachment) => {
      const getAttchmentPresignUrl = async (attachment: FileAttachment) => {
        const data = await queryClient.fetchQuery({
          queryKey: [QUERY_KEY.ATTACHMENT_PRESIGN_URL, attachment.id],
          queryFn: () => generateAudioPresignUrl(attachment.file_url),
          staleTime: DEFAULT_STALE_TIME_QUERY,
        });

        return data.presign_url;
      };

      try {
        setDownloading(true);
        const presignUrl = await getAttchmentPresignUrl(attachment);
        downloadMediaFileURL(
          presignUrl,
          attachment.file_name,
          null,
          (progress: number) => {
            console.log("progress", progress);
            setDownloadProgress(progress);
            if (progress === 100) {
              setTimeout(() => {
                setDownloading(false);
                setDownloadProgress(0);
              }, 300);
            }
          },
        );
      } catch (err) {
        setDownloading(false);
        setDownloadProgress(0);
      }
    };

    const onDeleteAttachment = async () => {
      await catchError(
        deleteAttachmentMutation.mutateAsync({
          audioId: audioId,
          attachmentId: attachment.id,
        }),
      );

      setDeleted(false);
    };

    return (
      <div
        key={attachment.id}
        className="flex items-center justify-between gap-4  "
      >
        <div className="flex grow items-center gap-2 sm:gap-4 overflow-x-hidden">
          <div className="shrink-0 rounded-md bg-primary p-2">
            <FileIcon className="size-4 sm:size-6" />
          </div>
          <div className="flex flex-col gap-1 overflow-hidden text-primary-foreground">
            <p className="text-xs text-white sm:text-sm">
              {attachment.file_name}
            </p>
            <p className="text-[10px] sm:text-xs">
              {formatDateTimeLocale(
                fromUnixTime(attachment.datetime / 1000),
                userSetting.language,
              )}
            </p>
            <p className="text-[10px] sm:text-xs">
              {t(tMessages.common.size())}: {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <IconButton
            className="float-right text-primary-foreground hover:text-white"
            onClick={() => downloadAttachment(attachment)}
          >
            <div className="relative">
              <DownloadIcon className="size-4 sm:size-5" />
              {downloading && (
                <CircularProgress
                  className="absolute -left-1 -top-[3px] size-6 sm:size-7"
                  progress={downloadProgress}
                />
              )}
            </div>
          </IconButton>
          <IconButton
            className="float-right text-primary-foreground hover:text-white"
            onClick={() => setDeleted(true)}
          >
            <Trash2Icon className="size-4 sm:size-5" />
          </IconButton>
        </div>

        <ConfirmationModal
          open={deleted}
          onOpenChange={(value) => {
            if (!value) setDeleted(false);
          }}
          onClose={() => setDeleted(false)}
          onConfirm={onDeleteAttachment}
          title={t(tMessages.common.deleteAttachmentConfirm())}
        />
      </div>
    );
  },
);

export default FileAttachmentItem;
