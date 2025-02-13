import { tMessages } from "@/locales/messages";
import { useTranslation } from "react-i18next";

const InstructionText = () => {
  const { t } = useTranslation();
  return (
    <div
      id="instruction-text"
      className="flex h-full w-full flex-col items-center justify-center gap-3 p-4"
    >
      <p className="text-center">
        <span className="font-medium">
          {t(tMessages.common.converNote1())}
        </span>
        <span className="font-medium">
          {t(tMessages.common.converNote2())}
        </span>
        <span className="font-medium">
          {t(tMessages.common.converNote3())}
        </span>
        <br />
        <span className="font-medium">
          {t(tMessages.common.converNote4())}
        </span>
        <span className="font-medium">
          {t(tMessages.common.converNote5())}
        </span>
        <br />
        <span className="font-medium">
          {t(tMessages.common.converNote6())}
        </span>
        <span className="font-medium">
          {t(tMessages.common.converNote7())}
        </span>
        <br />
        <br />
        <span className="text-sm text-primary-foreground">
          {t(tMessages.common.converNote8())}
        </span>
        <span className="text-sm text-primary-foreground">
          {t(tMessages.common.converNote9())}
        </span>
      </p>
    </div>
  );
};

export default InstructionText;
