import { AudioDeviceInfo } from "@/features/devices/types";
import { useState, useEffect } from "react";

const useAudioDevices = () => {
  const [audioInputDevices, setAudioInputDevices] = useState<AudioDeviceInfo[]>(
    [],
  );
  const [audioOutputDevices, setAudioOutputDevices] = useState<
    AudioDeviceInfo[]
  >([]);

  const enumerateDevices = () => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const inputs = devices.filter((device) => device.kind === "audioinput");
        const outputs = devices.filter(
          (device) => device.kind === "audiooutput",
        );
        setAudioInputDevices(
          inputs.map((x) => ({
            deviceId: x.deviceId,
            groupId: x.groupId,
            kind: x.kind,
            label: x.label,
          })),
        );
        setAudioOutputDevices(
          outputs.map((x) => ({
            deviceId: x.deviceId,
            groupId: x.groupId,
            kind: x.kind,
            label: x.label,
          })),
        );
      })
      .catch((err) => {
        console.error("Error enumerating devices:", err);
      });
  };

  useEffect(() => {
    enumerateDevices();
    navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        enumerateDevices,
      );
    };
  }, []);

  return { audioInputDevices, audioOutputDevices };
};

export { useAudioDevices };
