import Global from "@/components/icons/Global";
import WifiIcon from "@/components/icons/WifiIcon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { tMessages } from "@/locales/messages";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type LatencyStatus = "good" | "fair" | "moderate" | "poor" | "offline";

interface NavigatorExtended extends Navigator {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    addEventListener: (event: string, callback: () => void) => void;
  };
}

const NetworkIndicator: React.FC = () => {
  const { t } = useTranslation();
  const [latency, setLatency] = useState<number | "offline">(0);
  const [latencyStatus, setLatencyStatus] = useState<LatencyStatus>("offline");
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [connectionType, setConnectionType] = useState<string>("unknown");
  const [downlink, setDownlink] = useState<number>(0);

  const checkLatency = async () => {
    if (!navigator.onLine) {
      setLatency("offline");
      setLatencyStatus("offline");
      return;
    }

    const start = Date.now();
    try {
      await fetch("https://www.google.com", {
        method: "HEAD",
        mode: "no-cors",
      });
      const latencyTime = Date.now() - start;
      updateLatencyStatus(latencyTime);
      setLatency(latencyTime);
    } catch {
      updateLatencyStatus(1000);
      setLatency(1000);
    }
  };

  const updateLatencyStatus = (latency: number) => {
    if (latency < 100) setLatencyStatus("good");
    else if (latency < 200) setLatencyStatus("moderate");
    else if (latency < 400) setLatencyStatus("fair");
    else setLatencyStatus("poor");
  };

  const updateNetworkInfo = () => {
    const connection = (navigator as NavigatorExtended).connection;
    if (connection) {
      setConnectionType(connection.effectiveType || "unknown");
      setDownlink(connection.downlink || 0);
      connection.addEventListener("change", updateNetworkInfo);
    }
  };

  const getQualityClass = (value: string | number): string => {
    if (typeof value === "string") {
      switch (value) {
        case "4g":
          return "bg-[#43a047] ";
        case "3g":
          return "bg-[#ffeb3b] text-black";
        case "2g":
          return "bg-[#fb8c00]";
        default:
          return "bg-[#e53935]";
      }
    } else {
      return value >= 10
        ? "bg-[#43a047]"
        : value >= 5
          ? "bg-[#ffeb3b] text-black"
          : value >= 1
            ? "bg-[#fb8c00]"
            : "bg-[#e53935]";
    }
  };

  useEffect(() => {
    checkLatency();
    updateNetworkInfo();
    const interval = setInterval(checkLatency, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="mr-1 flex h-9 flex-col items-center justify-between text-sm transition duration-200 hover:scale-[1.2]">
          <div className="flex items-end gap-[3px]">
            {[4, 8, 12, 16].map((height, index) => (
              <div
                key={index}
                className={`w-[3px] rounded-[3px] transition-all ${
                  latencyStatus === "good" && index < 4
                    ? "bg-[#43a047] opacity-100"
                    : latencyStatus === "moderate" && index < 2
                      ? "bg-[#fb8c00] opacity-100"
                      : latencyStatus === "fair" && index < 3
                        ? "bg-[#ffeb3b] opacity-100"
                        : latencyStatus === "poor" && index < 1
                          ? "bg-[#e53935] opacity-100"
                          : "bg-[#444]"
                }`}
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
          <div
            className="text-nowrap text-center text-[8px] leading-3 text-[#a9a9a9]"
            onClick={() => setShowNetworkInfo(!showNetworkInfo)}
          >
            {latency === "offline" ? "offline" : `${latency} ms`}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="Z-[50] mr-4 flex justify-between border-0 bg-[#484848] text-[12px]">
        <div className="flex flex-col gap-2 text-white">
          <div className="flex items-center justify-start gap-2">
            <Global className="h-4 w-4" />{" "}
            <span
              className={`rounded-[3px] px-2 py-0.5 font-bold ${getQualityClass(connectionType)}`}
            >
              {connectionType.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-start gap-2">
            <WifiIcon className="h-4 w-4" />{" "}
            <span
              className={`rounded-[3px] px-2 py-0.5 font-bold ${getQualityClass(downlink)}`}
            >
              {downlink} Mbps
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-white">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-[#43a047]"></span>
            {t(tMessages.common.networkGood())}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-[#ffeb3b]"></span>
            {t(tMessages.common.networkFair())}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-[#fb8c00]"></span>
            {t(tMessages.common.networkModerate())}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-[#e53935]"></span>
            {t(tMessages.common.networkPoor())}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-[#a9a9a9]"></span>
            {t(tMessages.common.networkOffline())}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NetworkIndicator;
