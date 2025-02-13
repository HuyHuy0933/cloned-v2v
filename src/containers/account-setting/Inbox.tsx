import { Container, Header, IconButton } from "@/components";
import { CircleLeftArrowIcon } from "@/components/icons";
import AnimatedGreenCheckMark from "@/components/shared/GreenCheckMark/AnimatedGreenCheckMark";
import { tMessages } from "@/locales/messages";
import { RootState } from "@/main";
import { cloneDeep } from "lodash";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Inbox = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profileSettingLastLocation = useSelector(
    (state: RootState) => state.ui.profileSettingLastLocation,
  );

  const goBack = () => {
    if (profileSettingLastLocation) {
      navigate(`${profileSettingLastLocation.pathname}${profileSettingLastLocation.search}`, {
        state: cloneDeep(profileSettingLastLocation.state),
      });
    } else {
      navigate("/recorder");
    }
  };

  const leftHeader = (
    <IconButton className="z-10" onClick={goBack}>
      <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
    </IconButton>
  );

  return (
    <div className="flex h-full w-full flex-col p-4">
      <Header leftItem={leftHeader} />
      <Container>
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <span className="font-bold">{t(tMessages.common.emptyInbox())}</span>
          <span className="text-primary-foreground">
            {t(tMessages.common.noticeIfHasInbox())}
          </span>
          <AnimatedGreenCheckMark />
        </div>
      </Container>
    </div>
  );
};

export default Inbox;
