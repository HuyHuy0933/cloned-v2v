import {
  ConfirmationModal,
  Container,
  Header,
  HorizontalTransition,
  IconButton,
  Label,
  PrimaryButton,
} from "@/components";
import {
  CircleLeftArrowIcon,
  ChevronSelectorVerticalIcon,
  ResetIcon,
  AudioOutputIcon,
  Microphone3Icon,
} from "@/components/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, UseSelector, useSelector } from "react-redux";
import { RootState } from "@/main";
import { resetSetting } from "@/features/settings/settingSlice";
import { useEffect, useRef, useState } from "react";
import TermsOfServiceModal from "./TermsOfServiceModal";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { cloneDeep } from "lodash";
import { useAudioDevices, useCurrentUser } from "@/hooks";
import AudioDeviceSelect from "./setting-selects/AudioDeviceSelect";
import {
  setInputDevice,
  setOutputDevice,
} from "@/features/devices/deviceSlice";
import { isDesktop } from "@/lib/constaints";
import VoiceSetting from "./voice-setting/VoiceSetting";
import { useDebounce } from "use-debounce";
import { useSaveUserSettingsMutation } from "@/features/current-user/mutations";
import { config } from "@/lib/config";

const AccountSetting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const saveUserSettings = useSaveUserSettingsMutation();

  const profileSettingLastLocation = useSelector(
    (state: RootState) => state.ui.profileSettingLastLocation,
  );
  const device = useSelector((state: RootState) => state.device);
  const setting = useSelector((state: RootState) => state.setting);
  const { audioInputDevices, audioOutputDevices } = useAudioDevices();
  const { currentUser, setting: userSetting } = useCurrentUser();
  const [openResetModal, setOpenResetModal] = useState(false);
  const [debouncedSetting] = useDebounce(setting, 1000);

  const mountedRef = useRef(false);

  // useEffect(() => {
  //   if (debouncedSetting && mountedRef.current) {
  //     const { _persist, ...rest } = debouncedSetting;
  //     saveUserSettings.mutate({
  //       settings: rest,
  //       email: currentUser.email,
  //       language: userSetting.language,
  //     });
  //   }
  //   mountedRef.current = true;
  // }, [debouncedSetting]);

  const goBack = () => {
    if (profileSettingLastLocation) {
      navigate(
        `${profileSettingLastLocation.pathname}${profileSettingLastLocation.search}`,
        {
          state: cloneDeep(profileSettingLastLocation.state),
        },
      );
    } else {
      navigate("/recorder");
    }
  };

  const closeResetModal = () => {
    setOpenResetModal(false);
  };

  const confirmResetSetting = () => {
    setOpenResetModal(false);
    dispatch(resetSetting());
  };

  const leftHeader = (
    <IconButton className="z-10" onClick={goBack}>
      <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
    </IconButton>
  );

  const rightHeader = (
    <IconButton
      className="h-9 flex-col justify-between hover:text-success"
      onClick={() => setOpenResetModal(true)}
    >
      <ResetIcon />
      <span className="text-[8px] leading-3">{t(tMessages.common.reset())}</span>
    </IconButton>
  );

  return (
    <HorizontalTransition>
      <Header leftItem={leftHeader} rightItem={rightHeader} />

      <Container className="mt-4 flex-col">
        <div className="flex w-full grow flex-col gap-4">
          {/* audio devices select */}
          {isDesktop && (
            <div className="space-y-2">
              <Label className="text-sm">
                {t(tMessages.common.audioDeviceSetting())}
              </Label>
              <AudioDeviceSelect
                value={device.inputDevice}
                options={audioInputDevices}
                onChange={(value) => dispatch(setInputDevice(value))}
                trigger={
                  <PrimaryButton
                    prependIcon={<Microphone3Icon />}
                    appendIcon={<ChevronSelectorVerticalIcon />}
                  >
                    {device.inputDevice.label}
                  </PrimaryButton>
                }
                bottomContent={t(tMessages.setting.microphoneTooltip())}
              />
              <AudioDeviceSelect
                value={device.outputDevice}
                options={audioOutputDevices}
                onChange={(value) => dispatch(setOutputDevice(value))}
                trigger={
                  <PrimaryButton
                    prependIcon={<AudioOutputIcon />}
                    appendIcon={<ChevronSelectorVerticalIcon />}
                  >
                    {device.outputDevice.label}
                  </PrimaryButton>
                }
                bottomContent={t(tMessages.setting.speakerTooltip())}
              />
            </div>
          )}

          {/* separtor */}
          {isDesktop && (
            <div className="h-[1px] w-full bg-primary-foreground"></div>
          )}

          <VoiceSetting />
        </div>
        <br />

        {!config.kuritaVersion ? <TermsOfServiceModal /> : <></> }
        <p className="w-full text-center text-xs text-primary-foreground">
          AtPeak
        </p>
      </Container>

      <ConfirmationModal
        open={openResetModal}
        onOpenChange={setOpenResetModal}
        onConfirm={confirmResetSetting}
        onClose={closeResetModal}
        title={t(tMessages.common.resetSettingConfirm())}
      />
    </HorizontalTransition>
  );
};

export default AccountSetting;
