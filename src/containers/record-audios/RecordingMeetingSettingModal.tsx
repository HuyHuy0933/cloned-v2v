import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  JollyFieldGroup,
  JollyLabel,
  JollyNumberField,
  JollyNumberFieldInput,
  JollyNumberFieldSteppers,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@/components";
import { STT_MODE } from "@/features/settings/types";
import { useCurrentUser } from "@/hooks";
import { allLanguages } from "@/lib/constaints";
import { tMessages } from "@/locales/messages";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type RecordingMeetingSettingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateRecordingMeeting: (language: string, numSpeakers: number) => void;
  sttMode: string;
};

const RecordingMeetingSettingModal: React.FC<
  RecordingMeetingSettingModalProps
> = ({ isOpen, onClose, onCreateRecordingMeeting, sttMode }) => {
  const { t } = useTranslation();
  const { setting } = useCurrentUser();

  const [numSpeakers, setNumSpeakers] = useState<number>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<string>(setting.language);
  const whisperSTTMode = false;

  const handleStartRecording = () => {
    setIsRecording(true);
    onCreateRecordingMeeting(language, numSpeakers);

    // Reset numSpeakers for next time
    setNumSpeakers(1);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && isRecording) {
          // Prevent closing the modal when clicking outside
          return;
        }

        onClose();
      }}
    >
      <DialogContent className="w-[90%] max-w-xl md:w-[700px] md:max-w-xl">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex w-full flex-col gap-2">
          <div className="field w-full">
            <Label>{t(tMessages.common.language())}</Label>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="bg-modal"
                ref={(ref) => {
                  if (!ref) return;
                  ref.ontouchend = (e) => e.preventDefault();
                }}
              >
                {allLanguages.map((item) => (
                  <SelectItem
                    className="cursor-none text-white focus:bg-primary-foreground"
                    key={item.code}
                    value={item.code}
                  >
                    <div className="flex flex-row space-x-2">
                      <img src={item.flagUrl} alt="flag" width={15} />
                      <span>{t(item.title())}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {whisperSTTMode && (
            <div className="field w-full">
              <JollyNumberField
                defaultValue={numSpeakers}
                minValue={1}
                step={1}
                onChange={(value) => {
                  setNumSpeakers(value);
                }}
                isDisabled={isRecording}
              >
                <JollyLabel>{t(tMessages.common.numOfSpeakers())}</JollyLabel>
                <JollyFieldGroup
                  className="bg-transparent"
                  style={{
                    boxShadow: "none",
                  }}
                >
                  <JollyNumberFieldInput
                    onKeyDown={(event) => {
                      const invalidKeys = [".", "e", "+", "-"];
                      if (invalidKeys.includes(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                  <JollyNumberFieldSteppers />
                </JollyFieldGroup>
              </JollyNumberField>

              <p className="mt-2">
                ⚠️{" "}
                <span className="text-sm text-primary-foreground">
                  {t(tMessages.common.whospeaksModelWarning())}
                </span>
              </p>
            </div>
          )}

          <div className="field mt-2 w-full">
            <Button
              className="h-10 w-full bg-neutral-200 text-black hover:bg-white"
              onClick={handleStartRecording}
              disabled={isRecording}
            >
              {t(tMessages.common.startRecording())}
              {isRecording && <Spinner className="ml-2 size-4 text-modal" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingMeetingSettingModal;
