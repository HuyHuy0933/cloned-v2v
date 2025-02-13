import { useToast } from "@/components/ui/use-toast";
import { useNetworkStatus } from "./useNetworkStatus";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

export const useAlertNetworkStatus = () => {
  const { t } = useTranslation();
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();

  useEffect(() => {
    if (isOnline === undefined) return;
    toast({
      title: isOnline
        ? t(tMessages.common.onlineV2V())
        : t(tMessages.common.checkNetwork()),
      description: isOnline
        ? t(tMessages.common.internetConnected())
        : t(tMessages.common.internetDisconnected()),
      duration: 3000,
    });
  }, [isOnline]);
};
