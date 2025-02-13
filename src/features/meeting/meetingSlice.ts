import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MeetingRoom, MeetingUser } from "./types";
import { boolean } from "zod";
import { update } from "lodash";
import { stat } from "fs";

export type MeetingAudioSetting = {
  muted: boolean;
  originVolume: number;
  translatedVolume: number;
  lastOriginVolume: number;
  lastTranslatedVolume: number;
};
export type MeetingState = {
  room: MeetingRoom;
  currentUser: MeetingUser;
  audioSetting: MeetingAudioSetting;
};

const initialState: MeetingState = {
  room: {
    meetingId: "",
    meetingName: "",
  },
  currentUser: {
    email: "",
    userId: "",
    username: "",
    language: "",
  },
  audioSetting: {
    muted: false,
    originVolume: 1,
    translatedVolume: 1,
    lastOriginVolume: 1,
    lastTranslatedVolume: 1,
  },
};

const meetingSlice = createSlice({
  name: "meeting",
  initialState,
  reducers: {
    setMeetingMetadata: (
      state: MeetingState,
      action: PayloadAction<{ room: MeetingRoom; currentUser: MeetingUser }>,
    ) => {
      state.room = action.payload.room;
      state.currentUser = action.payload.currentUser;
    },
    clearMeetingMetadata: (state: MeetingState) => {
      return initialState;
    },
    setOriginVolume: (state: MeetingState, action: PayloadAction<number>) => {
      state.audioSetting.originVolume = action.payload;
      state.audioSetting.lastOriginVolume = action.payload;
    },
    setTranslatedVolume: (
      state: MeetingState,
      action: PayloadAction<number>,
    ) => {
      state.audioSetting.translatedVolume = action.payload;
      state.audioSetting.lastTranslatedVolume = action.payload;
    },
    setMuted: (state: MeetingState) => {
      state.audioSetting.muted = !state.audioSetting.muted;
      if (!state.audioSetting.muted) {
        state.audioSetting.originVolume = state.audioSetting.lastOriginVolume;
        state.audioSetting.translatedVolume =
          state.audioSetting.lastTranslatedVolume;
      } else {
        state.audioSetting.originVolume = 0;
        state.audioSetting.translatedVolume = 0;
      }
    },
  },
});

const { actions, reducer: meetingReducer } = meetingSlice;

export const {
  setMeetingMetadata,
  clearMeetingMetadata,
  setOriginVolume,
  setMuted,
  setTranslatedVolume,
} = actions;
export default meetingReducer;
