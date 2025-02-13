import { tMessages } from "@/locales/messages";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type TeleprompterProps = {
  speed: number;
};

const Teleprompter: React.FC<TeleprompterProps> = ({ speed }) => {
  const { t } = useTranslation();
  const [isScrolling, setIsScrolling] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = () => {
    if (isScrolling && scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const currentScroll = scrollContainer.scrollTop;
      const maxScroll =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;

      if (currentScroll >= maxScroll) {
        setIsScrolling(false);
      } else {
        scrollContainer.scrollTop = currentScroll + 1;
      }
    }
  };

  useEffect(() => {
    const intervalId = setInterval(scroll, speed);

    return () => {
      clearInterval(intervalId);
    };
  }, [isScrolling]);

  const handleToggleScroll = () => {
    setIsScrolling((prev) => !prev);
  };

  return (
    <div className="grow overflow-auto" onClick={handleToggleScroll}>
      <div className="h-full overflow-y-scroll" ref={scrollContainerRef}>
        <p>
          <br />
          <br />５<br />
          <br />４<br />
          <br />３<br />
          <br />２<br />
          <br />１<br />
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line1.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line2.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line3.text1())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line3.text2())}
            <rt>{t(tMessages.cloneTelePrompter.line3.text3())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line3.text4())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line3.text5())}
            <rt>{t(tMessages.cloneTelePrompter.line3.text6())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line3.text7())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line4.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line5.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line6.text1())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line6.text2())}
            <rt>{t(tMessages.cloneTelePrompter.line6.text3())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line6.text4())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line6.text5())}
            <rt>{t(tMessages.cloneTelePrompter.line6.text6())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line6.text7())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line6.text8())}
            <rt>{t(tMessages.cloneTelePrompter.line6.text9())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line6.text10())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line7.text1())}
          <ruby>{t(tMessages.cloneTelePrompter.line7.text2())}</ruby>
          {t(tMessages.cloneTelePrompter.line7.text3())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line7.text4())}
            <rt>{t(tMessages.cloneTelePrompter.line7.text5())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line7.text6())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line8.text1())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line8.text2())}
            <rt>{t(tMessages.cloneTelePrompter.line8.text3())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line8.text4())}
          <ruby>{t(tMessages.cloneTelePrompter.line8.text5())}</ruby>
          {t(tMessages.cloneTelePrompter.line8.text6())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line9.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line10.text1())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line10.text2())}
            <rt> {t(tMessages.cloneTelePrompter.line10.text3())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line10.text4())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line10.text5())}
            <rt> {t(tMessages.cloneTelePrompter.line10.text6())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line10.text7())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line11.text1())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line11.text2())}
            <rt>{t(tMessages.cloneTelePrompter.line11.text3())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line11.text4())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line11.text5())}
            <rt>{t(tMessages.cloneTelePrompter.line11.text6())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line11.text7())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line12.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line13.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line14.text1())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line14.text2())}
            <rt>{t(tMessages.cloneTelePrompter.line14.text3())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line14.text4())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line15.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line16.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line17.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line18.text1())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line18.text2())}
            <rt>{t(tMessages.cloneTelePrompter.line18.text3())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line18.text4())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line19.text1())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line19.text2())}
            <rt>{t(tMessages.cloneTelePrompter.line19.text3())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line19.text4())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line19.text5())}
            <rt>{t(tMessages.cloneTelePrompter.line19.text6())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line19.text7())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line20.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line21.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line22.text1())}
          <ruby>
            {t(tMessages.cloneTelePrompter.line22.text2())}
            <rt>{t(tMessages.cloneTelePrompter.line22.text3())}</rt>
          </ruby>
          {t(tMessages.cloneTelePrompter.line22.text4())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line23.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line24.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line25.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line26.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line27.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line28.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line29.text())}
          <br />
          <br />
          {t(tMessages.cloneTelePrompter.line30.text())}
          <br />
          <br />
        </p>
      </div>
    </div>
  );
};

export default Teleprompter;
