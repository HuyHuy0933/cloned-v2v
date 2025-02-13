import { useRouteError, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { tMessages } from "@/locales/messages";
import { useTranslation } from "react-i18next";

const ErrorBoundary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const error: any = useRouteError();

  useEffect(() => {
    const handleBackButton = () => {
      window.location.reload();
    };
    
    window.addEventListener("popstate", handleBackButton);

    return () => {      
      window.removeEventListener("popstate", handleBackButton);
    };

  }, []);

  const handleHomeClick = () => {    
    navigate("/recorder", { replace: true });
    window.location.reload();
  };

  const handleBackClick = () => {
    navigate(-1);
    setTimeout(() => {
        window.location.reload();
    }, 300);
  };

  return (
    <div className="foreground flex h-dvh flex-col items-start justify-center gap-4 bg-[#3498DB] px-6 text-white md:container md:px-40">
      <h1 className="m-0 p-0 text-[8rem] leading-[10rem] md:text-[14rem] md:leading-[18rem]">
        orz
      </h1>
      <h2 className="text-[1.2rem] md:text-[1.8rem]">
        <span className="text-[2.5rem] font-semibold md:text-[3.5rem]">
          Oops!
        </span>
        <br /> {t(tMessages.common.unexpectedError())}
      </h2>
      <h6 className="my-6">{error.statusText || error.message}</h6>
      <div className="flex flex-row justify-start items-center">
        <Button
          variant="link"
          onClick={handleHomeClick}
          className="rounded-none p-0 text-[1.2rem] text-white hover:bg-white hover:text-[#3498DB] hover:no-underline md:text-[1.8rem]"
        >
          {t(tMessages.common.goHome())}
        </Button>        
        <span className="px-3 text-md md:text-lg">|</span>
        <Button
          variant="link"
          onClick={handleBackClick}
          className="rounded-none p-0 text-[1.2rem] text-white hover:bg-white hover:text-[#3498DB] hover:no-underline md:text-[1.8rem]"
        >
          {t(tMessages.common.goBack())}
        </Button>
      </div>
    </div>
  );
};

export { ErrorBoundary };
