import { useUserProfileQuery } from "@/features/auth/queries";
import { getUserSetting, getUserUsage } from "@/features/current-user/queries";
import {
  CurrentUser,
  UserSetting,
  UserUsage,
} from "@/features/current-user/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@/components";
import { tMessages } from "@/locales/messages";
import { useTranslation } from "react-i18next";
import { useSaveUserSettingsMutation } from "@/features/current-user/mutations";
import { allLanguages, flagIcon, QUERY_KEY } from "@/lib/constaints";
import { catchError } from "@/lib/trycatch";
import { useDispatch, useSelector } from "react-redux";
import { updateRecorder } from "@/features/conversation/conversationSlice";
import {
  initialState as initialSettingState,
  LEFT_POSITION,
  RIGHT_POSITION,
  setSetting,
  sttModeOptions,
} from "@/features/settings/settingSlice";
import { RootState } from "@/main";
import { mapDataObjWithDefault } from "@/lib/utils";
import { STT_MODE } from "@/features/settings/types";

export type CurrentUserContextType = {
  currentUser: CurrentUser;
  usage: UserUsage;
  setting: UserSetting;
  refetchUsage: () => Promise<void>;
  updateUserSetting: (setting: Partial<UserSetting>) => void;
};

export const CurrentUserContext = createContext<
  CurrentUserContextType | undefined
>(undefined);

interface CurrentUserProviderProps {
  children: ReactNode;
}

export const CurrentUserProvider: React.FC<CurrentUserProviderProps> = ({
  children,
}: CurrentUserProviderProps) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: currentUser } = useUserProfileQuery();

  const { t, i18n } = useTranslation();
  // const saveUserSettingMutation = useSaveUserSettingsMutation();

  const leftRecorder = useSelector(
    (state: RootState) => state.conversation.leftRecorder,
  );
  const rightRecorder = useSelector(
    (state: RootState) => state.conversation.rightRecorder,
  );

  const [usage, setUsage] = useState<UserUsage | undefined>({
    audio_upload_ai_summary_tokens: 0,
    audio_upload_noise_suppression_time_minutes: 0,
    audio_upload_time_minutes: 0,
    chatbot_ai_tokens: 0,
    custom_voice_audio_samples_count: 0,
    custom_voice_count: 0,
    meeting_ai_summary_tokens: 0,
    meeting_noise_suppression_time_minutes: 0,
    meeting_time_minutes: 0,
    meeting_stt_time_minutes: 0,
    meeting_tts_time_characters: 0,
    meeting_voice_cloning_tts_time_characters: 0,
    recording_ai_summary_tokens: 0,
    recording_noise_suppression_time_minutes: 0,
    recording_time_minutes: 0,
    translate_stt_time_minutes: 0,
    meeting_translated_characters: 0,
    translate_translated_characters: 0,
    translate_tts_time_characters: 0,
    translate_voice_cloning_tts_time_characters: 0
  });
  const [userSetting, setUserSetting] = useState<UserSetting | undefined>(
    {
      language: 'en-US',
      email: 'kenji.sakuramoto@gmail.com',
      tutorial: {
        basic: 'completed'
      },
    },
  );
  const [fetchedSetting, setFetchedSeting] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const notExistLang = userSetting && !flagIcon[userSetting.language];

  useEffect(() => {
    if (currentUser) {
      // fetchUsage();
      // fetchSetting();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!fetchedSetting) return;

    if (!userSetting || !userSetting.language || notExistLang) {
      setOpen(true);
      dispatch(
        updateRecorder({
          position: LEFT_POSITION,
          language: i18n.language,
        }),
      );
    } else {
      i18n.changeLanguage(userSetting.language);
      if (rightRecorder.language === userSetting.language) {
        dispatch(
          updateRecorder({
            position: RIGHT_POSITION,
            language: leftRecorder.language,
          }),
        );
      }
      dispatch(
        updateRecorder({
          position: LEFT_POSITION,
          language: userSetting.language,
        }),
      );
    }
  }, [userSetting, fetchedSetting, notExistLang]);

  const fetchUsage = useCallback(async () => {
    const [_, usage] = await catchError(
      queryClient.fetchQuery({
        queryKey: [QUERY_KEY.USER_USAGE],
        queryFn: () => getUserUsage(),
      }),
    );

    if (usage) {
      setUsage(usage);
    }
  }, [usage]);

  const fetchSetting = async () => {
    // await saveUserSettingMutation.mutateAsync({
    //   email: currentUser?.email,
    // });
    const [_, data] = await catchError(
      queryClient.fetchQuery({
        queryKey: [QUERY_KEY.USER_SETTINGS],
        queryFn: () => getUserSetting(),
        staleTime: Infinity,
      }),
    );

    if (data) {
      if (
        data.settings &&
        !sttModeOptions.map((x) => x.value).includes(data.settings.sttMode)
      ) {
        // handle for old stt mode which is removed
        data.settings.sttMode = STT_MODE.AZURE;
      }
      setUserSetting(data);
      if (data.settings) {
        dispatch(
          setSetting(mapDataObjWithDefault(data.settings, initialSettingState)),
        );
      }
    }
    setFetchedSeting(true);
  };

  const saveLanguage = async () => {
    setSaving(true);
    // await saveUserSettingMutation.mutateAsync({
    //   language: i18n.language,
    //   email: currentUser?.email,
    // });
    setSaving(false);
    setOpen(false);
    setUserSetting({
      ...userSetting,
      language: i18n.language,
    });
  };

  const updateSetting = useCallback(
    (newSetting: Partial<UserSetting>) => {
      if (!userSetting) return;
      console.log(newSetting)
      setUserSetting({
        ...userSetting,
        ...newSetting,
      });
    },
    [userSetting],
  );

  if (!currentUser || !usage || !userSetting)
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        usage,
        refetchUsage: fetchUsage,
        setting: userSetting,
        updateUserSetting: updateSetting,
      }}
    >
      {children}
      <Dialog open={open}>
        <DialogContent className="w-[90%] max-w-xl md:w-[700px] md:max-w-xl">
          <DialogHeader>
            <DialogTitle className="w-full text-start leading-6 text-white">
              {t(tMessages.common.chooseLanguageConfirm())}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="w-full">
            <Select
              value={i18n.language}
              onValueChange={(value) => i18n.changeLanguage(value)}
            >
              <SelectTrigger className="f-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-modal">
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

            <p className="mt-2 text-sm">
              {t(tMessages.common.changeLaterInProfile())}
            </p>

            <div className="mt-4 flex justify-end">
              <Button
                className="bg-success hover:bg-success"
                onClick={saveLanguage}
                disabled={saving}
              >
                {saving ? (
                  <Spinner className="size-4" />
                ) : (
                  t(tMessages.common.confirm())
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("You are in not the current user context");
  }

  return context;
};
