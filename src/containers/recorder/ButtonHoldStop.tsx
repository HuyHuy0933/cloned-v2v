import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import "./styles/buttonHoldStop.scss";
import { tMessages } from "@/locales/messages";

type ButtonHoldStopProps = {
  stopRecord: () => void;
};

const duration = 1000;

const ButtonHoldStop: React.FC<ButtonHoldStopProps> = ({ stopRecord }) => {
    const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const success = () => {
    if (buttonRef.current) {
      buttonRef.current.classList.add("success");
    }
    setTimeout(stopRecord, duration);
  };

  const handleMouseDown = () => {
    if (buttonRef.current) {
      buttonRef.current.classList.add("process");
      timeoutRef.current = setTimeout(success, duration);
    }
  };

  const handleMouseUp = (e: any) => {
    e.preventDefault();
    if (buttonRef.current) {
      buttonRef.current.classList.remove("process");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }  
      
  };

  return (
    <button
      ref={buttonRef}
      className="button-hold"
      onMouseDown={handleMouseDown}
      onMouseUp={(e) => handleMouseUp(e)}
      onMouseOut={(e) => handleMouseUp(e)}
      onTouchStart={handleMouseDown}
      onTouchEnd={(e) => handleMouseUp(e)}
      onKeyPress={(e) => {
        if (e.key === " " && !buttonRef.current?.classList.contains("process")) {
          handleMouseDown();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " ") {          
          handleMouseUp(e);     
        }
      }}
    >
        <div>
            <svg
                className="icon"
                width="16"
                height="16"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M9 9H23V23H9V9Z" fill="#FF0000" />
            </svg>
            <svg className="progress h-5 w-5" viewBox="0 0 32 32">
                <circle r="8" cx="16" cy="16" />
            </svg>
            <svg className="tick h-5 w-5" viewBox="0 0 24 24">
                <polyline points="18,7 11,16 6,12" />
            </svg>
        </div>
        {t(tMessages.common.holdStopRecording())}
    </button>
  );
};

export default ButtonHoldStop;
