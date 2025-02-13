import React, { useState, useEffect } from "react";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/components/shared/FileUpload";
import { CloudUploadIcon } from "@/components/icons";
import MusictNote from "@/components/icons/MusicNote";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import ExclamationCircle from "../icons/ExclamationCircle";

type AudioFileUploadProps = {
  onFileChange: (file: File | undefined) => void;
  onRemoveFile: () => void;
  maxFileSizeText?: string;
  maxFileSize?: number; //in MB
  placeholder?: string;
};

const AudioFileUpload: React.FC<AudioFileUploadProps> = React.memo(({
  onFileChange,
  onRemoveFile,
  maxFileSizeText,
  maxFileSize,
  placeholder
}) => {
  const [files, setFiles] = useState<File[] | null>(null);
  const [fileSize, setFileSize] = useState<string>("0");
  const [fileError, setFileError] = useState(false);
  const { t } = useTranslation();

  const dropZoneConfig = {
    accept: {
      "audio/*": [
        ".mp3",
        ".wav",
        ".ogg",
        ".m4a",
        ".aac",
        ".flac",
        ".wma",
        ".amr",
        ".aiff",
      ],
    },
    maxFiles: 1,
    maxSize: maxFileSize ? maxFileSize * 1024 * 1024 : Infinity,
    multiple: false,
  };

  useEffect(() => {
    if (files && files.length > 0) {
      onFileChange(files[0]);
      const fSize = (files[0].size / 1024).toFixed(1) + " KB";
      setFileSize(fSize);
      setFileError(false);
    } else {
      onFileChange(undefined);
    }
  }, [files, onFileChange]);

  const handleRemoveFile = () => {
    onRemoveFile();
  };

  const handleFileTooLarge = () => {
    setFileError(true);
  };

  return (
    <FileUploader
      value={files}
      onValueChange={setFiles}
      dropzoneOptions={dropZoneConfig}
      className="relative"
      onFileTooLarge={handleFileTooLarge}
    >
      <FileInput>
        <div className="flex w-full flex-col items-center justify-center pb-4 pt-3">
          <CloudUploadIcon className="size-8" />
          <p className="mb-1 text-sm text-white">
            {placeholder || t(tMessages.common.uploadModalTitle())}
          </p>
          <span className="text-xs text-primary-foreground">
            {maxFileSizeText}
          </span>
        </div>
      </FileInput>
      {fileError && (
        <div className="flex items-center justify-center gap-2 py-2 text-red-500">
          <ExclamationCircle className="h-[20px] w-[20px]" />
          <p className="text-sm font-bold">
            {t(tMessages.common.fileTooLarge())}
          </p>
        </div>
      )}
      <FileUploaderContent>
        {files &&
          files.length > 0 &&
          files.map((file, i) => (
            <FileUploaderItem
              key={i}
              index={i}
              onRemove={handleRemoveFile}
              className="mt-2 rounded bg-primary p-3 px-0"
            >
              <MusictNote className="h-4 min-w-4 stroke-current" />
              <span className="text-wrap break-all text-xs">
                {file.name} | {fileSize}
              </span>
            </FileUploaderItem>
          ))}
      </FileUploaderContent>
    </FileUploader>
  );
});

export { AudioFileUpload };
