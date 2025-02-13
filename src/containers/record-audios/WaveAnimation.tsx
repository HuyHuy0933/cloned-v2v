import React, { useEffect } from "react";
import "./styles/WaveAnimation.scss";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

const WaveAnimation = () => {
  const { t } = useTranslation();
  useEffect(() => {
    const bars = document.querySelectorAll(".bar");
    bars.forEach((bar) => {
      const htmlBar = bar as HTMLElement;
      htmlBar.style.animationDuration = `${Math.random() * (0.7 - 0.2) + 0.2}s`;
    });
  }, []);

  const bars = Array.from({ length: 160 }, (_, i) => (
    <div key={i} className="bar mx-[1.5px] h-[5px] w-[1px] bg-[#313031]"></div>
  ));

  return (
    <div className="flex w-full h-full grow flex-col items-center justify-center space-y-2 pb-0">
      <div className="sound-wave flex h-[30px] items-center justify-center py-14">
        {bars}
      </div>
      <span>{t(tMessages.common.noRecordHistory())}</span>
      <span className="text-center text-sm text-primary-foreground">
        {t(tMessages.common.wantToRecordOrUpload())}
      </span>
    </div>
  );
};

export default WaveAnimation;
