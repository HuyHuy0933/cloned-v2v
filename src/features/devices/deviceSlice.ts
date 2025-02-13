import { createSlice } from "@reduxjs/toolkit";
import { AudioDeviceInfo } from "./types";

export type DeviceState = {
  inputDevice: AudioDeviceInfo;
  outputDevice: AudioDeviceInfo;
};

const initialState: DeviceState = {
  inputDevice: {
    deviceId: "default",
    groupId: "default",
    kind: "audioinput",
    label: "Default",
  },
  outputDevice: {
    deviceId: "default",
    groupId: "default",
    kind: "audiooutput",
    label: "Default",
  },
};

const deviceSlice = createSlice({
  name: "device",
  initialState,
  reducers: {
    setInputDevice: (state, action) => {
      state.inputDevice = action.payload;
    },
    setOutputDevice: (state, action) => {
      state.outputDevice = action.payload;
    },
  },
});

export const { setInputDevice, setOutputDevice } = deviceSlice.actions;
export default deviceSlice.reducer;
