import React, { useRef, useState } from "react";
import { RecorderItem } from "./Conversation";
import { flagIcon, LanguageOption } from "@/lib/constaints";
import { Button, PrimaryButton, VerticalDrawer } from "@/components";
import {
  CheckIcon,
  ChevronSelectorVerticalIcon,
  Microphone96x108Icon,
  Microphone70x70Icon,
  OrangeRecording88x88Icon,
  OrangeRecording42x42Icon,
} from "@/components/icons";
//@ts-ignore
import { LiveAudioVisualizer } from "react-audio-visualize";
import { useTranslation } from "react-i18next";

type LanguageRecorderProps = {
  recorder: RecorderItem;
  startRecording: (recorder: RecorderItem) => Promise<void>;
  stopRecording: () => void;
  onLanguageChange?: (value: RecorderItem) => void;
  disabledRecord?: boolean;
  modalDirection?: "top" | "bottom";
  faceToFaceMode?: boolean;
  mediaRecorder?: MediaRecorder;
  recording?: boolean;
  languages: LanguageOption[];
  showLargeRecorderBtn: boolean;
};

const LanguageRecorder: React.FC<LanguageRecorderProps> = ({
  recorder,
  startRecording,
  stopRecording,
  onLanguageChange,
  disabledRecord,
  modalDirection = "bottom",
  faceToFaceMode = false,
  mediaRecorder,
  recording = false,
  languages,
  showLargeRecorderBtn = true,
}) => {
  const { t } = useTranslation();
  const waveformRef = useRef<any>(null);
  const [openLanguageSelector, setOpenLanguageSelector] = useState(false);

  const onMicroClick = async () => {
    if (!recording) {
      await startRecording(recorder);
    } else {
      stopRecording();
    }
  };

  const selectLanguage = (value: LanguageOption) => {
    if (!onLanguageChange) return;
    onLanguageChange({
      position: recorder.position,
      language: value.code,
    });
    setOpenLanguageSelector(false);
  };

  const disabledLangSelector = !onLanguageChange;
  const title = languages.find((x) => x.code === recorder.language)?.title;

  let recorderButton = (
    <div className="flex h-full w-full flex-col gap-1">
      {/* open language selector */}
      {
        <Button
          className={`h-[50px] w-full justify-between rounded-b-none rounded-t-2xl ${disabledLangSelector ? "disabled:opacity-100" : ""}`}
          disabled={recording || disabledRecord || disabledLangSelector}
          onClick={() => setOpenLanguageSelector(true)}
        >
          <div className="flex gap-2">
            <img
              src={flagIcon[recorder.language]}
              alt={flagIcon[recorder.language]}
              width={20}
            />
            {title && <span>{t(title())}</span>}
          </div>

          {!disabledLangSelector ? <ChevronSelectorVerticalIcon /> : <></>}
        </Button>
      }

      {/* microphone button */}
      <Button
        className={`rounded-b-2xl rounded-t-none ${faceToFaceMode ? "h-[102px]" : "h-[146px]"} group relative`}
        onClick={onMicroClick}
        disabled={disabledRecord}
      >
        {recording ? (
          <div className="z-10 rounded-full bg-[#3b3b3b] group-hover:bg-[#797979]">
            <OrangeRecording88x88Icon />
          </div>
        ) : (
          <Microphone96x108Icon />
        )}

        <div className="absolute w-4/5 opacity-50" ref={waveformRef}>
          {recording && mediaRecorder && waveformRef.current && (
            <LiveAudioVisualizer
              mediaRecorder={mediaRecorder}
              width={waveformRef.current.clientWidth}
              height={80}
              barColor="hsla(0, 0%, 100%, 0.5)"
              barWidth={3}
              gap={3}
            />
          )}
        </div>
      </Button>
    </div>
  );

  if (!showLargeRecorderBtn) {
    recorderButton = (
      <div className="flex w-full justify-between gap-0.5">
        {/* open language selector */}
        <Button
          className={`h-[50px] w-14 rounded-none rounded-tl-2xl ${disabledLangSelector ? "disabled:opacity-100" : ""}`}
          disabled={recording || disabledRecord || disabledLangSelector}
          onClick={() => setOpenLanguageSelector(true)}
        >
          <div className="flex items-center justify-center">
            <img
              src={flagIcon[recorder.language]}
              alt={flagIcon[recorder.language]}
              width={20}
            />
          </div>
        </Button>

        {/* microphone button */}
        <Button
          className="group relative h-[50px] grow rounded-none rounded-tr-2xl"
          onClick={onMicroClick}
          disabled={disabledRecord}
        >
          {recording ? (
            <div className="h-40px z-10 rounded-full bg-[#3b3b3b] group-hover:bg-[#797979] border-2 border-white/50">
              <OrangeRecording42x42Icon className="w-8 h-8" />
            </div>
          ) : (
            <Microphone70x70Icon />
          )}

          <div className="absolute w-4/5 opacity-50" ref={waveformRef}>
            {recording && mediaRecorder && waveformRef.current && (
              <LiveAudioVisualizer
                mediaRecorder={mediaRecorder}
                width={waveformRef.current.clientWidth}
                height={30}
                barColor="hsla(0, 0%, 100%, 0.5)"
                barWidth={3}
                gap={3}
              />
            )}
          </div>
        </Button>
      </div>
    );
  }

  return (
    <>
      {recorderButton}

      {/* language selector modal */}
      <VerticalDrawer
        open={openLanguageSelector}
        onClose={() => setOpenLanguageSelector(false)}
        onOpenChange={setOpenLanguageSelector}
        direction={modalDirection}
      >
        {languages.map((lang: LanguageOption) => (
          <PrimaryButton
            prependIcon={
              <img src={lang.flagUrl} alt={lang.flagUrl} width={20} />
            }
            appendIcon={
              lang.code === recorder.language ? <CheckIcon /> : undefined
            }
            className="h-[52px] justify-start rounded-2xl"
            key={lang.code}
            onClick={() => selectLanguage(lang)}
          >
            <span>{t(lang.title())}</span>
          </PrimaryButton>
        ))}
      </VerticalDrawer>
    </>
  );
};

export default LanguageRecorder;
