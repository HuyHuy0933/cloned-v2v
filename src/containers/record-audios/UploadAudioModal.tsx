import {
  audioAccepts,
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
import { CloudUploadIcon } from "@/components/icons";
import { useUploadRecordAudioMutation } from "@/features/record-audios/mutations";
import {
  FINE_TUNED_MODEL,
  RECORDED_AUDIO_TYPE,
  SUMMARY_AI_TEMPLATE,
  UploadAudioRequest,
} from "@/features/record-audios/types";
import { getAudioDurationFromURL } from "@/lib/utils";
import { tMessages } from "@/locales/messages";
import { RootState } from "@/main";
import { add } from "date-fns";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import AudioOptionsSelect from "./AudioOptionsSelect";

type UploadAudioModalProps = {};

const UploadAudioModal: React.FC<UploadAudioModalProps> = React.memo(() => {
  const { t } = useTranslation();

  const customNames = useSelector(
    (state: RootState) => state.setting.customNames,
  );

  const censoredWords = useSelector(
    (state: RootState) => state.setting.censoredWords,
  );

  const uploadRecordAudioMutation = useUploadRecordAudioMutation();

  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | undefined>(undefined);
  const [uploadFileDuration, setUploadFileDuration] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [removeNoise, setRemoveNoise] = useState<boolean>(false);
  const [masking, setMasking] = useState<boolean>(false);
  const [model, setModel] = useState<string>(FINE_TUNED_MODEL.GENERAL);
  const [numSpeakers, setNumSpeakers] = useState<number>(0);
  const [analyzeSentiment, setAnalyzeSentiment] = useState<boolean>(false);
  const [enableSummaryAI, setEnableSummaryAI] = useState<boolean>(true);
  const [summaryAITemplate, setSummaryAITemplate] = useState<string>(
    SUMMARY_AI_TEMPLATE.MEETING,
  );

  const resetUploadModal = () => {
    setRemoveNoise(false);
    setMasking(false);
    setModel(FINE_TUNED_MODEL.GENERAL);
    setUploadFile(undefined);
    setUploadFileDuration(0);
    setEnableSummaryAI(true);
    setSummaryAITemplate(SUMMARY_AI_TEMPLATE.MEETING);
  };

  const onOpenUploadChange = (open: boolean) => {
    setOpenUploadModal(open);
    setUploadFile(undefined);
    if (!open) {
      resetUploadModal();
    }
  };

  const handleFileChange = (file: File | undefined) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      getAudioDurationFromURL(fileURL).then((duration) => {
        if (duration === Infinity) return;
        setUploadFileDuration(duration);
        setUploadFile(file);
      });
    } else {
      removeFile();
    }
  };

  const removeFile = () => {
    setUploadFile(undefined);
    setUploadFileDuration(0);
  };

  const uploadAudioFile = async () => {
    try {
      if (!uploadFile) return;
      setUploading(true);
      const startTime = new Date();
      startTime.setMilliseconds(0);
      startTime.setSeconds(0);
      const uploadReq: UploadAudioRequest = {
        audio: uploadFile,
        duration: uploadFileDuration,
        startDateTime: startTime.getTime(),
        endDateTime: add(startTime, { seconds: uploadFileDuration }).getTime(),
        removeNoise,
        model,
        type: RECORDED_AUDIO_TYPE.UPLOAD,
        masking,
        customNames,
        censoredWords,
        location: "",
        analyze_sentiment: analyzeSentiment,
        enableAISummary: enableSummaryAI,
        summaryAITemplate: enableSummaryAI ? summaryAITemplate : "",
        numSpeakers: numSpeakers,
      };

      await uploadRecordAudioMutation.mutateAsync(uploadReq);
      closeModal();
    } catch (err) {
      console.error("Error uploading audio", err);
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    resetUploadModal();
    setOpenUploadModal(false);
  };

  return (
    <Dialog open={openUploadModal} onOpenChange={onOpenUploadChange}>
      <DialogTrigger asChild>
        <IconButton
          className="flex-col hover:text-success"
          onClick={() => setOpenUploadModal(true)}
        >
          <CloudUploadIcon />
          <span className="text-[8px] leading-3">
            {t(tMessages.common.upload())}
          </span>
        </IconButton>
      </DialogTrigger>
      <DialogContent className="w-[90%] max-w-xl md:w-[700px] md:max-w-xl z-[2000]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {/* Select file box */}
        <div className="relative flex w-full flex-col items-center justify-center space-x-2 rounded-lg bg-[#1A1A1A] p-3">
          <CustomFileUpload
            onFileChange={(value) => handleFileChange(value)}
            onRemoveFile={removeFile}
            accept={audioAccepts}
          />
          {uploadFile && (
            <Button
              className="mt-4 w-[150px] rounded-xl py-2"
              onClick={uploadAudioFile}
            >
              {uploading ? (
                <Spinner className="size-4" />
              ) : (
                t(tMessages.common.upload())
              )}
            </Button>
          )}
        </div>

        <AudioOptionsSelect
          removeNoise={removeNoise}
          setRemoveNoise={setRemoveNoise}
          masking={masking}
          setMasking={setMasking}
          model={model}
          setModel={setModel}
          analyzeSentiment={analyzeSentiment}
          setAnalyzeSentiment={setAnalyzeSentiment}
          enableSummaryAI={enableSummaryAI}
          setEnableSummaryAI={setEnableSummaryAI}
          summaryAITemplate={summaryAITemplate}
          setSummaryAITemplate={setSummaryAITemplate}
          numSpeakers={numSpeakers}
          setNumSpeakers={setNumSpeakers}
        />
      </DialogContent>
    </Dialog>
  );
});

export default UploadAudioModal;
