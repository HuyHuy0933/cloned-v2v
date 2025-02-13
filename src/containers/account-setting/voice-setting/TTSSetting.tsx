import {
  emotionOptions,
  genderOptions,
  LEFT_POSITION,
  realtimeMeetingOptions,
  RIGHT_POSITION,
  setLeftVoice,
  setMeetingVoice,
  setRealtimeMeetingMode,
  setRightVoice,
  setStyleBertVits2,
  setTTSMode,
  ttsModeOptions,
} from "@/features/settings/settingSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/main";
import { useElevenLabsVoicesQuery } from "@/features/cloned-voices/queries";
import { OptionSelect } from "@/components";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { Label, PrimaryButton } from "@/components";
import { UserVoiceIcon, ChevronSelectorVerticalIcon } from "@/components/icons";
import SpeedSliderSelect from "../setting-selects/SpeedSliderSelect";
import ToneSliderSelect from "../setting-selects/ToneSliderSelect";
import IntonationSliderSelect from "../setting-selects/IntonationSliderSelect";
import ClonedVoiceSelect from "../setting-selects/ClonedVoiceSelect";
import { AddVoiceIcon, ChevronRightIcon } from "@/components/icons";
import { ElevenLabsVoice } from "@/features/cloned-voices/types";
import {
  StyleBertVits2Setting,
  TTS_CLONED_MODE,
} from "@/features/settings/types";
import PitchScaleSliderSelect from "../setting-selects/PitchScaleSliderSelect";

const TTSSetting = () => {
  const { t } = useTranslation();
  const setting = useSelector((state: RootState) => state.setting);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: voices } = useElevenLabsVoicesQuery();

  const emotionTitle = emotionOptions.find(
    (x) => x.value === setting.styleBertVits2.style,
  )!.title;

  const genderTitle = genderOptions.find(
    (x) => x.value === setting.styleBertVits2.gender.toString(),
  )!.title;

  const selectTTSMode = (value: string) => {
    dispatch(setTTSMode(value));
  };

  const updateStyleBertVits2 = (
    value: number | string,
    key: keyof StyleBertVits2Setting,
  ) => {
    dispatch(setStyleBertVits2({ [key]: value }));
  };

  const selectMeetingClonedVoice = (value: ElevenLabsVoice) => {
    dispatch(setMeetingVoice(value));
  };

  const selectMeetingMode = (value: boolean) => {
    dispatch(setRealtimeMeetingMode(value));
  };

  const selectClonedVoice = (value: ElevenLabsVoice, position: string) => {
    if (position === LEFT_POSITION) {
      dispatch(setLeftVoice(value));
    }

    if (position === RIGHT_POSITION) {
      dispatch(setRightVoice(value));
    }
  };

  return (
    <div className="flex w-full grow flex-col gap-4">
      <p className="w-full text-center text-xs text-primary-foreground">
        {t(tMessages.setting.ttsTabDesc())}
      </p>
      {/* tts mode select */}
      <div className="flex flex-col space-y-2">
        <OptionSelect
          label={t(tMessages.common.ttsSettings())}
          value={setting.ttsMode}
          onChange={selectTTSMode}
          options={ttsModeOptions}
          bottomContent={t(tMessages.setting.ttsTooltip())}
        />

        {/* tts style-bert-vits2 mode settings */}
        {setting.ttsMode === TTS_CLONED_MODE.STYLE_BERT_VITS2 && (
          <>
            <SpeedSliderSelect
              value={setting.styleBertVits2.speed}
              onChange={(value) => updateStyleBertVits2(value, "speed")}
              trigger={
                <PrimaryButton
                  className="w-full justify-center gap-4 px-4"
                  appendIcon={<ChevronSelectorVerticalIcon />}
                >
                  <div className="flex grow flex-row items-baseline justify-between">
                    <span>{t(tMessages.common.speed())}</span>
                    <span className="max-w-40 overflow-hidden text-sm text-primary-foreground">
                      {setting.styleBertVits2.speed}
                    </span>
                  </div>
                </PrimaryButton>
              }
            />

            <OptionSelect
              value={setting.styleBertVits2.style}
              options={emotionOptions}
              onChange={(value) => updateStyleBertVits2(value, "style")}
              trigger={
                <PrimaryButton
                  className="w-full justify-center gap-4 px-4"
                  appendIcon={<ChevronSelectorVerticalIcon />}
                >
                  <div className="flex grow flex-row items-baseline justify-between">
                    <span>{t(tMessages.common.emotion())}</span>
                    <span className="max-w-40 overflow-hidden text-sm text-primary-foreground">
                      {typeof emotionTitle === "function"
                        ? t(emotionTitle())
                        : emotionTitle}
                    </span>
                  </div>
                </PrimaryButton>
              }
            />

            <OptionSelect
              value={setting.styleBertVits2.gender.toString()}
              options={genderOptions}
              onChange={(value) =>
                updateStyleBertVits2(Number(value), "gender")
              }
              trigger={
                <PrimaryButton
                  className="w-full justify-center gap-4 px-4"
                  appendIcon={<ChevronSelectorVerticalIcon />}
                >
                  <div className="flex grow flex-row items-baseline justify-between">
                    <span>{t(tMessages.common.gender())}</span>
                    <span className="max-w-40 overflow-hidden text-sm text-primary-foreground">
                      {typeof genderTitle === "function"
                        ? t(genderTitle())
                        : genderTitle}
                    </span>
                  </div>
                </PrimaryButton>
              }
            />

            <ToneSliderSelect
              value={setting.styleBertVits2.tone}
              onChange={(value) => updateStyleBertVits2(value, "tone")}
              trigger={
                <PrimaryButton
                  className="w-full justify-center gap-4 px-4"
                  appendIcon={<ChevronSelectorVerticalIcon />}
                >
                  <div className="flex grow flex-row items-baseline justify-between">
                    <span>{t(tMessages.common.tone())}</span>
                    <span className="max-w-40 overflow-hidden text-sm text-primary-foreground">
                      {setting.styleBertVits2.tone == 0
                        ? t(tMessages.common.low())
                        : t(tMessages.common.high())}
                    </span>
                  </div>
                </PrimaryButton>
              }
            />

            <PitchScaleSliderSelect
              value={setting.styleBertVits2.pitchScale}
              onChange={(value) => updateStyleBertVits2(value, "pitchScale")}
              trigger={
                <PrimaryButton
                  className="w-full justify-center gap-4 px-4"
                  appendIcon={<ChevronSelectorVerticalIcon />}
                >
                  <div className="flex grow flex-row items-baseline justify-between">
                    <span>{t(tMessages.common.pitch())}</span>
                    <span className="max-w-40 overflow-hidden text-sm text-primary-foreground">
                      {setting.styleBertVits2.pitchScale}
                    </span>
                  </div>
                </PrimaryButton>
              }
            />

            <IntonationSliderSelect
              value={setting.styleBertVits2.intonationScale}
              onChange={(value) =>
                updateStyleBertVits2(value, "intonationScale")
              }
              trigger={
                <PrimaryButton
                  className="w-full justify-center gap-4 px-4"
                  appendIcon={<ChevronSelectorVerticalIcon />}
                >
                  <div className="flex grow flex-row items-baseline justify-between">
                    <span>{t(tMessages.common.intonation())}</span>
                    <span className="max-w-40 overflow-hidden text-sm text-primary-foreground">
                      {setting.styleBertVits2.intonationScale}
                    </span>
                  </div>
                </PrimaryButton>
              }
            />
          </>
        )}
        {/* tts style-bert-vits2 mode settings */}
      </div>

      {/* meeting realtime mode select */}
      <div className="flex flex-col space-y-2">
        <Label className="text-sm">
          {t(tMessages.common.meetingTTSSettings())}
        </Label>
        {voices && (
          <ClonedVoiceSelect
            value={setting.meetingVoice}
            onChange={(value) => selectMeetingClonedVoice(value)}
            options={voices}
            trigger={
              <PrimaryButton
                className="w-full justify-center gap-4 px-4"
                prependIcon={<UserVoiceIcon />}
                appendIcon={<ChevronSelectorVerticalIcon />}
                disabled={setting.ttsMode !== TTS_CLONED_MODE.ELEVENLABS_CLONED}
              >
                <div className="flex grow flex-row items-baseline justify-between">
                  <span>{t(tMessages.common.voiceCloned())}</span>
                  <span className="max-w-40 overflow-hidden text-sm text-primary-foreground">
                    {setting.meetingVoice.name}
                  </span>
                </div>
              </PrimaryButton>
            }
          />
        )}
        <OptionSelect
          value={setting.realtimeMeetingMode.toString()}
          onChange={(value) => {
            selectMeetingMode(value === "true");
          }}
          options={realtimeMeetingOptions}
        />
      </div>

      {/* conversation translation TTS setting */}
      <div className="flex flex-col gap-2">
        {voices && (
          <Label className="text-sm">
            {t(tMessages.common.conversationTTSSettings())}
          </Label>
        )}

        {/* cloned voice select */}
        <div className="flex flex-col space-y-2">
          {voices && (
            <div className="flex grow flex-row gap-2 sm:gap-4">
              {/* left voice */}
              <ClonedVoiceSelect
                value={setting.leftVoice}
                options={voices}
                onChange={(value) => selectClonedVoice(value, LEFT_POSITION)}
                disabled={setting.ttsMode !== TTS_CLONED_MODE.ELEVENLABS_CLONED}
                title={t(tMessages.common.leftVoice())}
              />

              {/* right voice */}
              <ClonedVoiceSelect
                value={setting.rightVoice}
                options={voices}
                onChange={(value) => selectClonedVoice(value, RIGHT_POSITION)}
                disabled={setting.ttsMode !== TTS_CLONED_MODE.ELEVENLABS_CLONED}
                title={t(tMessages.common.rightVoice())}
              />
            </div>
          )}
        </div>
      </div>

      {/* add voice */}
      <div className="flex flex-col space-y-2">
        <Label className="text-sm">
          {t(tMessages.common.voiceCloneRegistration())}
        </Label>
        <PrimaryButton
          prependIcon={<AddVoiceIcon />}
          appendIcon={<ChevronRightIcon />}
          onClick={() => navigate("/add-voice")}
        >
          {t(tMessages.common.cloneVoice())}
        </PrimaryButton>
        {/* voice list  */}
        <PrimaryButton
          appendIcon={<ChevronRightIcon />}
          onClick={() => navigate("/voice-list")}
        >
          {t(tMessages.common.voiceClonedList())}
        </PrimaryButton>
      </div>
      {/* add voice */}
    </div>
  );
};

export default TTSSetting;
