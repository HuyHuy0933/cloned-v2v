import { useDispatch } from "react-redux";
import { useAudioDevices } from "./useAudioDevices";
import { useEffect } from "react";
import {
  setInputDevice,
  setOutputDevice,
} from "@/features/devices/deviceSlice";

export const useInitDefaultAudioDevices = () => {
  const dispatch = useDispatch();
  const { audioInputDevices, audioOutputDevices } = useAudioDevices();
  const defaultInputDevice = audioInputDevices.find(
    (x) => x.deviceId === "default",
  );
  const defaultOutputDevice = audioOutputDevices.find(
    (x) => x.deviceId === "default",
  );
  useEffect(() => {
    if (defaultInputDevice) {
      dispatch(setInputDevice(defaultInputDevice));
    }

    if (defaultOutputDevice) {
      dispatch(setOutputDevice(defaultOutputDevice));
    }
  }, [defaultInputDevice, defaultOutputDevice]);
};
