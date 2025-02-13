import {
  Button,
  Container,
  Header,
  HorizontalTransition,
  IconButton,
} from "@/components";
import { CircleLeftArrowIcon } from "@/components/icons";
import { RootState } from "@/main";
import { cloneDeep } from "lodash";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTutorialData } from "./useTutorialData";
import { startTutorial } from "@/features/tutorial/tutorialSlice";
import { tMessages } from "@/locales/messages";
import {
  TUTORIAL_ENUM,
  TUTORIAL_STATUS,
  TutorialData,
} from "@/features/tutorial/types";
import { useCurrentUser } from "@/hooks";
import { render } from "react-dom";

const TutorialList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileSettingLastLocation = useSelector(
    (state: RootState) => state.ui.profileSettingLastLocation,
  );

  const { setting } = useCurrentUser();
  const tutorials = useTutorialData();

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

  const onStartTutorial = (tutorial: TutorialData) => {
    if (!tutorial.name) return;

    switch (tutorial.name) {
      case TUTORIAL_ENUM.basic: {
        navigate("/recorder");
        dispatch(startTutorial(tutorial.name));
        break;
      }
      default: {
        break;
      }
    }
  };

  const renderStatusTitle = (tutorial: TutorialData) => {
    if (!setting.tutorial) {
      return "Not started";
    }

    if (!tutorial.name || !setting.tutorial[tutorial.name]) {
      return t(tMessages.common.commingSoon());
    }

    const status = setting.tutorial[tutorial.name];
    if (status === TUTORIAL_STATUS.not_started) {
      return t(tMessages.common.notStarted());
    }

    if (status === TUTORIAL_STATUS.pending) {
      return t(tMessages.common.pending());
    }

    return t(tMessages.common.complete());
  };

  const statusColor = (tutorial: TutorialData) => {
    if (
      !setting.tutorial ||
      !tutorial.name ||
      !setting.tutorial[tutorial.name]
    ) {
      return "#525252";
    }

    const status = setting.tutorial[tutorial.name];
    if (status === TUTORIAL_STATUS.not_started) {
      return "#525252";
    }

    if (status === TUTORIAL_STATUS.pending) {
      return "#ffa500";
    }

    return "hsl(var(--success))";
  };

  const leftHeader = (
    <IconButton className="z-10" onClick={goBack}>
      <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
    </IconButton>
  );

  return (
    <HorizontalTransition>
      <Header leftItem={leftHeader} />
      <Container className="flex-col">
        <p className="mt-2 w-full px-2 text-center">
          {t(tMessages.tutorial.title1())}
          <br />
          {t(tMessages.tutorial.title2())}
          <br />
          {t(tMessages.tutorial.title3())}
        </p>

        <div className="mt-4 w-full space-y-2">
          {tutorials.map((tutorial: TutorialData, index: number) => (
            <Button
              key={index}
              className="flex w-full items-center justify-between gap-6 rounded bg-[#303030] px-2 py-3 hover:bg-primary-foreground"
              style={{
                opacity: !!tutorial.name ? 1 : 0.5,
              }}
              onClick={() => onStartTutorial(tutorial)}
              disabled={!tutorial.name}
            >
              <p className="text-sm sm:text-base w-auto text-wrap text-left">
                {index + 1}. {tutorial.title}
              </p>
              <div
                className="flex shrink-0 h-8 items-center justify-center p-2 text-xs rounded-xl sm:text-sm shadow-lg"
                style={{
                  backgroundColor: statusColor(tutorial),
                }}
              >
                {renderStatusTitle(tutorial)}
              </div>
            </Button>
          ))}
        </div>
      </Container>
    </HorizontalTransition>
  );
};

export default TutorialList;
