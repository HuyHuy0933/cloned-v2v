import {
  Header,
  HorizontalTransition,
  IconButton,
  LanguageSelect,
  PrimaryButton,
  UserAvatar,
} from "@/components";
import {
  ChevronSelectorVerticalIcon,
  CircleLeftArrowIcon,
} from "@/components/icons";
import { useCurrentUser } from "@/hooks";
import { allLanguages, LanguageOption } from "@/lib/constaints";
import { RootState } from "@/main";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserUsage from "./UserUsage";
import { tMessages } from "@/locales/messages";
import { useSaveUserSettingsMutation } from "@/features/current-user/mutations";
import { cloneDeep } from "lodash";

import UsageSeparator from "./UsageSeparator";

const MyProfile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const profileSettingLastLocation = useSelector(
    (state: RootState) => state.ui.profileSettingLastLocation,
  );

  const { currentUser, updateUserSetting, setting } = useCurrentUser();
  // const saveUserSettingMutation = useSaveUserSettingsMutation();

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

  const selectedLang =
    allLanguages.find((x) => x.code === i18n.language) || allLanguages[0];

  const onLanguageChange = async (value: LanguageOption) => {
    // saveUserSettingMutation.mutateAsync({
    //   language: value.code,
    //   email: currentUser.email,
    // });
    updateUserSetting({
      language: value.code,
    });
  };

  const leftHeader = (
    <IconButton className="z-10" onClick={goBack}>
      <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
    </IconButton>
  );

  const hasMetadata = currentUser.metadata && currentUser.metadata.area;
  return (
    <HorizontalTransition>
      <Header leftItem={leftHeader} />
      <div className="w-full">
        <div className="mt-2 flex w-full flex-col gap-2">
          {/* user avatar */}
          <div className="flex h-[150px] w-full flex-col items-center justify-center space-y-2">
            <UserAvatar
              className="size-10"
              username={currentUser.email.split("@")[0]}
            />
            <span className="font-medium">{currentUser.email}</span>
            <div className="mt-2 text-center text-sm text-primary-foreground">
              <p>{setting.group}</p>

              {hasMetadata && (
                <>
                  <p>
                    {t(tMessages.common.area())}: {currentUser.metadata.area}
                  </p>
                  <p>
                    {t(tMessages.common.storeName())}:{" "}
                    {currentUser.metadata.branch}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* user name */}
          {/* <PrimaryButton
            prependIcon={<UserNameIcon />}
            appendIcon={<ChevronRightIcon />}
          >
            {t(tMessages.common.name())}
          </PrimaryButton> */}

          {/* user image */}
          {/* <PrimaryButton
            prependIcon={<CameraIcon />}
            appendIcon={<ChevronRightIcon />}
          >
            {t(tMessages.common.photograph())}
          </PrimaryButton> */}

          {/* user language */}
          <LanguageSelect
            value={selectedLang}
            options={allLanguages}
            onChange={onLanguageChange}
            triggerClass="gap-4"
            trigger={
              <PrimaryButton
                className="w-full justify-center gap-4 px-4"
                prependIcon={
                  <img src={selectedLang.flagUrl} alt="flag" width={15} />
                }
                appendIcon={<ChevronSelectorVerticalIcon />}
              >
                <div className="flex grow flex-row items-baseline justify-between">
                  <span>{t(tMessages.common.languageSetting())}</span>
                  <span className="max-w-40 overflow-hidden text-sm text-primary-foreground">
                    {t(selectedLang.title())}
                  </span>
                </div>
              </PrimaryButton>
            }
          />
          {/* seperator */}
          <UsageSeparator />
          {/* usage progress */}
          <UserUsage />
        </div>
      </div>
    </HorizontalTransition>
  );
};

export default MyProfile;
