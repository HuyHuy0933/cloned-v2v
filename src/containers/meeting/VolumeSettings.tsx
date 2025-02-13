import {
  Button,
  CustomSlider,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  VolumeToggleIcon,
} from "@/components";
import { Volume3Icon, VolumeMute2Icon } from "@/components/icons";
import {
  setMuted,
  setOriginVolume,
  setTranslatedVolume,
} from "@/features/meeting/meetingSlice";
import { tMessages } from "@/locales/messages";
import { RootState } from "@/main";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

const VolumeSettings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const audioSetting = useSelector(
    (state: RootState) => state.meeting.audioSetting,
  );

  const updateOriginVolume = (value: number) => {
    dispatch(setOriginVolume(value));
  };

  const updateMuted = () => {
    dispatch(setMuted());
  };

  const updateTranslatedVolume = (value: number) => {
    dispatch(setTranslatedVolume(value));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton className="h-9 flex-col transition duration-200 hover:scale-[1.2] justify-between">
          {/* <VolumeToggleIcon muted={audioSetting.muted} /> */}
          {audioSetting.muted ? (
            <>
              <VolumeMute2Icon className="text-transparent size-5" stroke="#e74c3c" />
              <span className="text-[8px] leading-3">OFF</span>
            </>
          ) : (
            <>
              <Volume3Icon className="text-transparent size-5" stroke="#78e08f" />
              <span className="text-[8px] leading-3">ON</span>
            </>
          )}
        </IconButton>
      </PopoverTrigger>
      <PopoverContent
        className="w-65 relative right-4 grid grid-cols-[1fr_1.5fr] grid-rows-[auto_auto_auto] gap-3 border-none bg-modal"
        align="center"
      >
        <div className="col-span-2">
          <Button onClick={updateMuted}>
            {audioSetting.muted
              ? t(tMessages.common.unmuteAll())
              : t(tMessages.common.muteAll())}
          </Button>
        </div>
        <span className="shrink-0 text-sm text-primary-foreground">
          {t(tMessages.common.originAudio())}
        </span>
        <CustomSlider
          value={[audioSetting.originVolume * 10]}
          max={10}
          min={0}
          step={1}
          className=""
          onValueChange={(value) => {
            updateOriginVolume(value[0] / 10);
          }}
        />
        <span className="shrink-0 text-sm text-primary-foreground">
          {t(tMessages.common.interpretation())}
        </span>
        <CustomSlider
          value={[audioSetting.translatedVolume * 10]}
          max={10}
          min={0}
          step={1}
          className=""
          onValueChange={(value) => {
            updateTranslatedVolume(value[0] / 10);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default VolumeSettings;
