import {
  setMeetingVoice,  
  setSTTMode,  
  sttModeOptions, 
  LEFT_POSITION,
  RIGHT_POSITION,
  setLeftVoice,
  setRightVoice,
  setCustomWordsSttV2,
} from "@/features/settings/settingSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/main";
import { useElevenLabsVoicesQuery } from "@/features/cloned-voices/queries";
import { OptionSelect, TooltipModal } from '@/components';
import { useTranslation } from 'react-i18next';
import { tMessages } from "@/locales/messages";
import { Label, PrimaryButton, TagsInput } from "@/components";
import { UserVoiceIcon, ChevronSelectorVerticalIcon } from "@/components/icons";
import SilentThresholdSelect from "../setting-selects/SilentThresholdSelect";
import { SpeakerClonedVoice, STT_MODE } from "@/features/settings/types";
import { useDebouncedCallback } from "use-debounce";

const STTSetting = () => {
  const { t } = useTranslation();
  const setting = useSelector((state: RootState) => state.setting);
  const dispatch = useDispatch();
  const { data: voices } = useElevenLabsVoicesQuery();
  const MAX_LENGTH_OF_WORDS = 50;

  const selectSTTMode = (value: string) => {
    dispatch(setSTTMode(value));       
  };

  const selectMeetingSilentThreshold = (
    payload: Partial<SpeakerClonedVoice>,
  ) => {
    dispatch(setMeetingVoice(payload));
  };

  const selectSilentThreshold = (
    payload: Partial<SpeakerClonedVoice>,
    position: string,
  ) => {
    if (position === LEFT_POSITION) {
      dispatch(setLeftVoice(payload));
    }

    if (position === RIGHT_POSITION) {
      dispatch(setRightVoice(payload));
    }
  };

  const onCustomWordsSttV2ChangeDebounced = useDebouncedCallback(
    (values: string[]) => {
      dispatch(setCustomWordsSttV2(values.join("\n")));
    },
    1000,
  );

  return (
    <div className="flex flex-col w-full grow gap-4">
      <p className="w-full text-center text-xs text-primary-foreground">
        {t(tMessages.setting.sttTabDesc())}
      </p>
      {/* stt mode select */}
      <OptionSelect
        label={t(tMessages.common.sttSettings())}
        value={setting.sttMode}
        onChange={selectSTTMode}
        options={sttModeOptions}
        bottomContent={t(tMessages.setting.sttTooltip())}
      />

      {/* Custom Words for STT (V2, V3) */}
      {(setting.sttMode == STT_MODE.AZURE || setting.sttMode == STT_MODE.MANUFACTURING) && 
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm">
              {t(tMessages.customWordsSttV2.header())}
            </Label>
            <TooltipModal>
              <div className="space-y-2">
                <p>{t(tMessages.customWordsSttV2.toolTip1())}</p>
                <p>{t(tMessages.customWordsSttV2.toolTip2())}</p>
              </div>
            </TooltipModal>
          </div>
          <TagsInput
            className="mt-2 h-auto"
            inputClassName="w-5/6"
            values={[...setting.customWordsSttV2.split("\n").filter((x) => !!x)]}
            onChange={onCustomWordsSttV2ChangeDebounced}
            placeholder={t(tMessages.customWordsSttV2.placeHolder())}
            maxLengthOfTags={MAX_LENGTH_OF_WORDS}      
          />
        </div>
      }

      {/* meeting cloned voice and silent threshold */}
      {voices && (
        <div className="flex flex-col space-y-2">
          <Label className="text-sm">
            {t(tMessages.common.meetingSTTSettings())}
          </Label>
          <SilentThresholdSelect
            value={setting.meetingVoice.silentThresholdSec}
            prevValue={setting.meetingVoice.prevSilentThresholdSec}
            onChange={(value) => selectMeetingSilentThreshold(value)}
            trigger={
              <PrimaryButton
                className="w-full justify-center gap-4 px-4"
                prependIcon={<UserVoiceIcon />}
                appendIcon={<ChevronSelectorVerticalIcon />}
              >
                <div className="flex grow flex-row items-baseline justify-between">
                  <span>{t(tMessages.common.breathingTime())}</span>
                  <span className="max-w-40 overflow-hidden text-sm text-primary-foreground">
                    {setting.meetingVoice.silentThresholdSec === 0.01
                      ? setting.meetingVoice.silentThresholdSec
                      : setting.meetingVoice.prevSilentThresholdSec * 10}
                  </span>
                </div>
              </PrimaryButton>
            }
          />
        </div>
      )}  

      {/* silent threshold seconds selector */}
      <div className="flex flex-col space-y-2">
        <Label className="text-sm">
          {t(tMessages.common.conversationSTTSettings())}
        </Label>
        <div className="flex grow gap-2 sm:gap-4">
          {/* left voice */}
          <SilentThresholdSelect
            value={setting.leftVoice.silentThresholdSec}
            prevValue={setting.leftVoice.prevSilentThresholdSec}
            onChange={(value) =>
              selectSilentThreshold(value, LEFT_POSITION)
            }
            title={t(tMessages.common.leftBreathTime())}
          />

          {/* right voice */}
          <SilentThresholdSelect
            value={setting.rightVoice.silentThresholdSec}
            prevValue={setting.rightVoice.prevSilentThresholdSec}
            onChange={(value) =>
              selectSilentThreshold(value, RIGHT_POSITION)
            }
            title={t(tMessages.common.rightBreathTime())}
          />
        </div>
      </div>
    </div>
  );
}

export default STTSetting;
