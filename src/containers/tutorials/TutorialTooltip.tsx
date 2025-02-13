import { Button } from "@/components";
import Joyride, {
  CallBackProps,
  STATUS,
  TooltipRenderProps,
} from "react-joyride";
import { useMediaQuery } from "usehooks-ts";
import { tutorialSteps } from "./steps";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/main";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { endTutorial, startTutorial } from "@/features/tutorial/tutorialSlice";
import confetti from "canvas-confetti";
import { tMessages } from "@/locales/messages";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks";
import { TUTORIAL_ENUM, TUTORIAL_STATUS } from "@/features/tutorial/types";
import { useLocation } from "react-router-dom";
import { useSaveTutorialMutation } from "@/features/tutorial/mutations";
import { set } from "lodash";
import { UserTutorial } from "@/features/current-user/types";

function CustomTooltip(props: TooltipRenderProps) {
  const { t } = useTranslation();
  const {
    continuous,
    index,
    primaryProps,
    skipProps,
    step,
    tooltipProps,
    size,
  } = props;

  return (
    <div
      className="tooltip__body rounded-sm bg-modal p-2 sm:w-[350px]"
      {...tooltipProps}
    >
      {step.title && <div className="text-lg font-bold">{step.title}</div>}
      <div className="mt-4 flex w-full text-sm text-white/80">
        {step.content}
      </div>
      {!step.data?.firework ? (
        <div className="mt-4 flex w-full justify-between">
          <Button
            variant="link"
            className="cursor-none text-primary-foreground hover:text-white"
            {...skipProps}
          >
            {t(tMessages.common.skip())}
          </Button>
          <div className="flex cursor-none items-center space-x-2">
            {index > 0 && (
              <p className="text-xs text-primary-foreground">
                {index}/{size}
              </p>
            )}
            {continuous && (
              <Button className="cursor-none" {...primaryProps}>
                {step?.data?.actionBtnTitle || <ArrowRightIcon />}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex w-full items-center justify-center">
          <Button className="cursor-none" {...primaryProps}>
            {step?.data?.actionBtnTitle}
          </Button>
        </div>
      )}
    </div>
  );
}

const TutorialTooltip = () => {
  const matches = useMediaQuery("(max-width: 768px)");
  const dispatch = useDispatch();
  const tutorial = useSelector((state: RootState) => state.tutorial);
  const { setting, updateUserSetting } = useCurrentUser();
  const location = useLocation();

  const saveTutorialMutation = useSaveTutorialMutation();
  const steps = !!tutorial.name ? tutorialSteps[tutorial.name]() : undefined;

  useEffect(() => {
    if (!setting.language || location.pathname !== "/recorder") return;

    if (!setting.tutorial) {
      dispatch(startTutorial(TUTORIAL_ENUM.basic));
    }
  }, [setting.language, setting.tutorial, location.pathname]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, origin, status, type, step } = data;
    if (step.data?.firework && status === STATUS.RUNNING) {
      console.log("trigger firework");
      triggerFireworks();
      saveTutorialMutation.mutateAsync({
        [tutorial.name]: TUTORIAL_STATUS.completed,
      });

      updateUserSetting({
        tutorial: {
          ...setting.tutorial,
          [tutorial.name]: TUTORIAL_STATUS.completed,
        },
      });
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      console.log("finished", data);
      if (
        status === STATUS.SKIPPED &&
        setting.tutorial?.[tutorial.name] !== TUTORIAL_STATUS.completed
      ) {
        saveTutorialMutation.mutateAsync({
          [tutorial.name]: TUTORIAL_STATUS.pending,
        });

        updateUserSetting({
          tutorial: {
            ...setting.tutorial,
            [tutorial.name]: TUTORIAL_STATUS.pending,
          },
        });
      }

      dispatch(endTutorial());
    }
  };

  const triggerFireworks = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  if (!steps) return null;

  return (
    <Joyride
      styles={{
        options: {
          arrowColor: "hsl(var(--modal))",
        },
        overlay: {
          height: "100%",
          cursor: "none",
        },
      }}
      floaterProps={{
        styles: {
          floater: {
            width: matches ? "80%" : "350px",
          },
          arrow: {
            length: 12,
            spread: 16,
          },
        },
      }}
      steps={steps}
      tooltipComponent={(props) => (
        <CustomTooltip
          {...props}
          size={steps.filter((x) => x.data.isStep).length}
        />
      )}
      callback={handleJoyrideCallback}
      run={true}
      continuous
      disableOverlayClose
      hideCloseButton
      showSkipButton
    />
  );
};

export default TutorialTooltip;
