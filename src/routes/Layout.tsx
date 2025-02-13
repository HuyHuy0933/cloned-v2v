import {
  AudioFolderIcon,
  RecorderIcon,
  ConversationIcon,
  MeetingIcon,
} from "@/components/icons";
import {
  NavigationBar,
  NavigationTab,
} from "@/components/shared/NavigationBar";
import { TUTORIAL_TARGET } from "@/containers/tutorials/steps";
import TutorialTooltip from "@/containers/tutorials/TutorialTooltip";
import { showNavTab } from "@/features/ui/uiSlice";
import { useCurrentUser } from "@/hooks";
import { tMessages } from "@/locales/messages";
import { RootState } from "@/main";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";

export const tabs: NavigationTab[] = [
  {
    title: tMessages.bottomTabs.conversation,
    icon: <ConversationIcon />,
    path: "/conversation",
    name: TUTORIAL_TARGET.translation,
  },
  {
    title: tMessages.bottomTabs.recorder,
    icon: <RecorderIcon />,
    path: "/recorder",
    name: TUTORIAL_TARGET.recorder,
  },
  {
    title: tMessages.bottomTabs.recordedAudios,
    icon: <AudioFolderIcon />,
    path: "/audios",
    name: TUTORIAL_TARGET.audios,
  },
  {
    title: tMessages.bottomTabs.meeting,
    icon: <MeetingIcon />,
    path: "/meeting-setting",
    name: TUTORIAL_TARGET.meeting,
  },
];

export const tabPaths = tabs.map((x) => x.path);

const Layout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const showNavBar = useSelector((state: RootState) => state.ui.showNavTab);
  const layout = useSelector((state: RootState) => state.ui.layout);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (!showNavBar) {
      dispatch(showNavTab());
    }
  }, [location.pathname]);

  const notTabScreen = !tabs.map((x) => x.path).includes(location.pathname);
  const navTabHidden =
    !showNavBar || notTabScreen || currentUser.isRecordingStrict;

  const isPCLayout = layout === "pc";
  let layoutClasses = `relative flex h-dvh flex-col bg-background text-white`;
  if (isPCLayout) {
    layoutClasses = "relative h-screen w-full bg-gray-97 p-8 text-black pc";
  }

  return (
    <div className="main_layout">
      <main className={layoutClasses}>
        <Outlet />
        {/* Navigation Bar */}

        <NavigationBar
          items={tabs}
          currentPath={location.pathname}
          hidden={navTabHidden}
        />
      </main>

      {!currentUser.isRecordingStrict && <TutorialTooltip />}
    </div>
  );
};

export default Layout;
