import React, { useState, useEffect } from "react";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/components/shared/FileUpload";
import { CloudUploadIcon } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import ExclamationCircle from "../icons/ExclamationCircle";
import { Accept } from "react-dropzone";
import { formatFileSize } from "@/lib/utils";

export const audioAccepts = {
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
};

type CustomFileUploadProps = {
  onFileChange: (file: File | undefined) => void;
  onRemoveFile: () => void;
  maxFileSizeText?: string;
  maxFileSize?: number; //in MB
  placeholder?: string;
  accept?: Accept;
};

const CustomFileUpload: React.FC<CustomFileUploadProps> = React.memo(
  ({
    onFileChange,
    onRemoveFile,
    maxFileSizeText,
    maxFileSize,
    placeholder,
    accept,
  }) => {
    const [files, setFiles] = useState<File[] | null>(null);
    const [fileSize, setFileSize] = useState<string>("0");
    const [fileError, setFileError] = useState(false);
    const { t } = useTranslation();

    const dropZoneConfig = {
      accept,
      maxFiles: 1,
      maxSize: maxFileSize ? maxFileSize * 1024 * 1024 : Infinity,
      multiple: false,
    };

    const onValueChange = (files: File[] | null) => {
      setFiles(files);
      if (files && files.length > 0) {
        onFileChange(files[0]);
        const fSize = formatFileSize(files[0].size);
        setFileSize(fSize);
        setFileError(false);
      } else {
        onFileChange(undefined);
      }
    };

    const handleRemoveFile = () => {
      onRemoveFile();
    };

    const handleFileTooLarge = () => {
      setFileError(true);
    };

    return (
      <FileUploader
        value={files}
        onValueChange={onValueChange}
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
                className="mt-2 rounded bg-primary p-3"
              >
                <span className="text-wrap break-all text-xs">
                  {file.name} | {fileSize}
                </span>
              </FileUploaderItem>
            ))}
        </FileUploaderContent>
      </FileUploader>
    );
  },
);

export { CustomFileUpload };
