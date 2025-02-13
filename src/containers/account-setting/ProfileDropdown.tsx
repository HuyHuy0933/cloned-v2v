import {
  ConfirmationModal,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  UserAvatar,
} from "@/components";
import {
  ArrowClockwise,
  EnvelopeIcon,
  GearIcon,
  Microphone3Icon,
  QuestionMarkIcon,
  SignOutIcon,
  UserIcon,
} from "@/components/icons";
import { setProfileSettingLastRoute } from "@/features/ui/uiSlice";
import { useCurrentUser } from "@/hooks";
import { config } from "@/lib/config";
import { LOCAL_STORAGE_KEY } from "@/lib/constaints";
import { formatLongDateTimeLocale } from "@/lib/datetime";
import { delay } from "@/lib/utils";
import { tMessages } from "@/locales/messages";
import { RootState } from "@/main";
import { cloneDeep } from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { TUTORIAL_TARGET } from "../tutorials/steps";
import TutorialIcon from "@/components/icons/TutorialIcon";

type ProfileDropdownProps = {
  disabled?: boolean;
};

const ProfileDropdown: React.FC<ProfileDropdownProps> = React.memo(
  ({ disabled = false }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const profileSettingLastLocation = useSelector(
      (state: RootState) => state.ui.profileSettingLastLocation,
    );

    const { currentUser } = useCurrentUser();
    const [openLogoutModal, setOpenLogoutModal] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [synced, setSynced] = useState(false);
    const [hover, setHover] = useState(false);

    useEffect(() => {
      if (profileSettingLastLocation?.pathname === location.pathname) return;
      dispatch(setProfileSettingLastRoute(cloneDeep(location)));
    }, [location]);

    const onSignout = () => {
      setOpenLogoutModal(true);
    };

    const closeSignOutModal = () => {
      setOpenLogoutModal(false);
    };

    const confirmSignOut = async () => {
      localStorage.removeItem(LOCAL_STORAGE_KEY.user_id);
      window.location.href = `${config.aiPlatformBaseUrl}/logout`;
    };

    const onClearCache = async (e: any) => {
      e.preventDefault();
      setSyncing(true);
      const cacheNames = await caches.keys();
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
      await delay(3000);
      setSyncing(false);
      setSynced(true);
      setTimeout(() => {
        setSynced(false);
      }, 1000);
      window.location.reload();
    };

    return (
      <>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <IconButton
              id={TUTORIAL_TARGET.profile_menu}
              onMouseOver={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              <UserAvatar
                className="size-8 transition duration-200 hover:scale-[1.2]"
                username={currentUser.name}
                hover={hover}
              />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="z-[1000] min-w-56 border-primary-foreground bg-neutral-700 px-2 text-white"
            align="end"
          >
            <DropdownMenuLabel className="flex flex-col items-center py-4">
              <span className="text-base font-bold">{currentUser.email}</span>
              <span className="text-sm text-neutral-400">
                {currentUser.name.split("@")[0]}
              </span>
              <span className="mt-1 text-xs">
                {formatLongDateTimeLocale(new Date(), i18n.language)}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-0 bg-neutral-500" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-none gap-3 text-base text-neutral-300 focus:bg-primary-foreground focus:text-neutral-200"
                onClick={() => navigate("/profile")}
              >
                <UserIcon />
                {t(tMessages.common.myPage())}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mx-0 bg-neutral-500" />

              <DropdownMenuItem
                className="cursor-none gap-3 text-base text-neutral-300 focus:bg-primary-foreground focus:text-neutral-200"
                // onClick={() => navigate("/microphone-test")}
              >
                <Microphone3Icon />
                {t(tMessages.common.microphoneTest())}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mx-0 bg-neutral-500" />
              <DropdownMenuItem
                className="cursor-none gap-3 text-base text-neutral-300 focus:bg-primary-foreground focus:text-neutral-200"
                // onClick={() => navigate("/inbox")}
              >
                <EnvelopeIcon />
                {t(tMessages.common.message())}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mx-0 bg-neutral-500" />
              <DropdownMenuItem
                className="cursor-none gap-3 text-base text-neutral-300 focus:bg-primary-foreground focus:text-neutral-200"
                onClick={() => navigate("/setting")}
              >
                <GearIcon />
                {t(tMessages.common.setting())}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mx-0 bg-neutral-500" />
              {!config.kuritaVersion && (
                <>
                  <DropdownMenuItem
                    className="cursor-none gap-3 text-base text-neutral-300 focus:bg-primary-foreground focus:text-neutral-200"
                    // onClick={() => navigate("/FAQs")}
                  >
                    <QuestionMarkIcon />
                    {t(tMessages.common.help())}
                  </DropdownMenuItem>{" "}
                  <DropdownMenuSeparator className="mx-0 bg-neutral-500" />
                </>
              )}

              {!currentUser.isRecordingStrict && (
                <>
                  <DropdownMenuItem
                    className="cursor-none gap-3 text-base text-neutral-300 focus:bg-primary-foreground focus:text-neutral-200"
                    // onClick={() => navigate("/tutorial")}
                  >
                    <TutorialIcon />
                    {t(tMessages.common.tutorial())}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-0 bg-neutral-500" />
                </>
              )}

              <DropdownMenuItem
                className="cursor-none gap-3 text-base text-neutral-300 focus:bg-primary-foreground focus:text-neutral-200"
                // onClick={onSignout}
              >
                <SignOutIcon />
                {t(tMessages.common.logout())}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-none justify-center gap-3 pb-0 text-[10px] text-neutral-300 focus:bg-transparent focus:text-neutral-300">
                {t(tMessages.common.trial())}: {config.appVersion}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-none justify-center gap-2 text-[10px] text-neutral-300 focus:bg-primary-foreground focus:text-neutral-300"
                // onClick={onClearCache}
              >
                <ArrowClockwise
                  className={`size-3 ${syncing ? "animate-spin" : ""}`}
                />
                {syncing
                  ? t(tMessages.common.syncing())
                  : synced
                    ? t(tMessages.common.refreshingPage())
                    : t(tMessages.common.syncNow())}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <ConfirmationModal
          open={openLogoutModal}
          onOpenChange={setOpenLogoutModal}
          onConfirm={confirmSignOut}
          onClose={closeSignOutModal}
          title={t(tMessages.common.logoutConfirm())}
        />
      </>
    );
  },
);

export default ProfileDropdown;
