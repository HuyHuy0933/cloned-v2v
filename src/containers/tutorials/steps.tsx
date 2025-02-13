import { TUTORIAL_ENUM } from "@/features/tutorial/types";
import { tMessages } from "@/locales/messages";
import { t } from "i18next";
import { Step } from "react-joyride";

export const enum TUTORIAL_TARGET {
  profile_menu = "profile_menu",
  translation = "translation",
  recorder = "recorder",
  audios = "audios",
  meeting = "meeting",
  start_recording = "start_recording",
}

type TutorialStep = Step & {
  data: {
    isStep: boolean;
    actionBtnTitle?: string;
    firework?: boolean;
  };
};

const useBasicSteps = (): Array<TutorialStep> => [
  {
    title: (
      <p className="w-full text-center text-xl font-bold">
        {t(tMessages.tutorial.welcome.title())}
      </p>
    ),
    target: "body",
    content: (
      <p className="w-full text-center text-sm">
        {t(tMessages.tutorial.welcome.desc1())}
      </p>
    ),
    disableBeacon: true,
    placement: "center",
    data: {
      isStep: false,
      actionBtnTitle: t(tMessages.common.start()),
    },
  },
  {
    title: t(tMessages.tutorial.profileMenu.title()),
    target: `#${TUTORIAL_TARGET.profile_menu}`,
    content: (
      <p>
        {t(tMessages.tutorial.profileMenu.desc1())}
        <br /> {t(tMessages.tutorial.profileMenu.desc2())}
      </p>
    ),
    disableBeacon: true,
    data: {
      isStep: true,
      actionBtnTitle: t(tMessages.common.next()),
    },
  },
  {
    title: t(tMessages.tutorial.translationTab.title()),
    target: `#${TUTORIAL_TARGET.translation}`,
    content: (
      <p>
        {t(tMessages.tutorial.translationTab.desc1())}
        <br />
        {t(tMessages.tutorial.translationTab.desc2())}
        <br />
        {t(tMessages.tutorial.translationTab.desc3())}
      </p>
    ),
    disableBeacon: true,
    data: {
      isStep: true,
      actionBtnTitle: t(tMessages.common.next()),
    },
  },
  {
    title: t(tMessages.tutorial.recorderTab.title()),
    target: `#${TUTORIAL_TARGET.recorder}`,
    content: (
      <p>
        {t(tMessages.tutorial.recorderTab.desc1())}
        <br />
        {t(tMessages.tutorial.recorderTab.desc2())}
        <br />
        {t(tMessages.tutorial.recorderTab.desc3())}
      </p>
    ),
    disableBeacon: true,
    data: {
      isStep: true,
      actionBtnTitle: t(tMessages.common.next()),
    },
  },
  {
    title: t(tMessages.tutorial.audiosTab.title()),
    target: `#${TUTORIAL_TARGET.audios}`,
    content: (
      <p>
        {t(tMessages.tutorial.audiosTab.desc1())}
        <br />
        {t(tMessages.tutorial.audiosTab.desc2())}
        <br />
        {t(tMessages.tutorial.audiosTab.desc3())}
      </p>
    ),
    disableBeacon: true,
    data: {
      isStep: true,
      actionBtnTitle: t(tMessages.common.next()),
    },
  },
  {
    title: t(tMessages.tutorial.meetingTab.title()),
    target: `#${TUTORIAL_TARGET.meeting}`,
    content: (
      <p>
        {t(tMessages.tutorial.meetingTab.desc1())}
        <br />
        {t(tMessages.tutorial.meetingTab.desc2())}
        <br />
        {t(tMessages.tutorial.recorderTab.desc3())}
      </p>
    ),
    disableBeacon: true,
    data: {
      isStep: true,
      actionBtnTitle: t(tMessages.common.next()),
    },
  },
  {
    title: t(tMessages.tutorial.startRecording.title()),
    target: `#${TUTORIAL_TARGET.start_recording}`,
    content: (
      <p>
        {t(tMessages.tutorial.startRecording.desc1())}
        <br />
        {t(tMessages.tutorial.startRecording.desc2())}
        <br />
        {t(tMessages.tutorial.startRecording.desc3())}
      </p>
    ),
    disableBeacon: true,
    data: {
      isStep: true,
      actionBtnTitle: t(tMessages.common.finish()),
    },
  },
  {
    title: (
      <p className="w-full text-center text-xl font-bold">
        {t(tMessages.tutorial.firework.title())}
      </p>
    ),
    target: "body",
    content: (
      <p className="w-full text-center text-sm">
        {t(tMessages.tutorial.firework.desc1())}
        <br />
        {t(tMessages.tutorial.firework.desc2())}
      </p>
    ),
    disableBeacon: true,
    data: {
      isStep: false,
      firework: true,
      actionBtnTitle: t(tMessages.common.close()),
    },
    placement: "center",
  },
];

// export const useWelcomeSteps = (): Array<Step> => [
//   {
//     title: (
//       <p className="w-full text-center text-xl font-bold">
//         {t(tMessages.tutorial.welcome.title())}
//       </p>
//     ),
//     target: "body",
//     content: (
//       <p className="w-full text-center text-sm">
//         {t(tMessages.tutorial.welcome.desc1())}
//       </p>
//     ),
//     disableBeacon: true,
//     placement: "center",
//     data: {
//       isStep: false,
//       actionBtnTitle: "Start",
//     },
//   },
//   ...useBasicSteps(),
// ];

export const tutorialSteps: Record<string, () => Array<Step>> = {
  [TUTORIAL_ENUM.basic]: useBasicSteps,
};
