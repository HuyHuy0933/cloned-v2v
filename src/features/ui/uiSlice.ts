import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Location } from "react-router-dom";

type TabContentConfig = {
  translatedX: string | number;
};

export type TabContentMap = Record<string, TabContentConfig>;

export type UIState = {
  layout: "mobile" | "pc"
  showNavTab: boolean;
  convShowLgRecordBtn: boolean;
  metShowLgRecordBtn: boolean;
  tabContent: TabContentMap;
  cursorColor: string;
  profileSettingLastLocation?: Location
};

const initialState: UIState = {
  layout: "mobile",
  showNavTab: true,
  convShowLgRecordBtn: true,
  metShowLgRecordBtn: true,
  tabContent: {
    conversation: {
      translatedX: "100%",
    },
    recorder: {
      translatedX: "100%",
    },
    audios: {
      translatedX: "100%",
    },
    'meeting-setting': {
      translatedX: "100%",
    },
  },
  cursorColor: 'white',
  profileSettingLastLocation: undefined
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showNavTab: (state: UIState) => {
      state.showNavTab = true;
    },
    hideNavTab: (state: UIState) => {
      state.showNavTab = false;
    },
    showConvLgRecordBtn: (state: UIState) => {
      state.convShowLgRecordBtn = true;
    },
    hideConvLgRecordBtn: (state: UIState) => {
      state.convShowLgRecordBtn = false;
    },
    showMetLgRecordBtn: (state: UIState) => {
      state.metShowLgRecordBtn = true;
    },
    hideMetLgRecordBtn: (state: UIState) => {
      state.metShowLgRecordBtn = false;
    },
    updateTabContentTranslatedX: (
      state: UIState,
      action: PayloadAction<string>,
    ) => {
      const keys = Object.keys(state.tabContent);
      const activeTab = action.payload;
      const currentIndex = keys.findIndex((x) => x === activeTab);

      keys.forEach((tab: string, index: number) => {
        if (index < currentIndex) {
          state.tabContent[tab].translatedX = "-100%";
        } else {
          state.tabContent[tab].translatedX = "100%";
        }
      });
    },
    mobileLayout: (state: UIState) => {
      state.layout = 'mobile'
      state.cursorColor = 'white'
    },
    pcLayout: (state: UIState) => {
      state.layout = 'pc'
      state.cursorColor = 'gray'
    },
    setProfileSettingLastRoute : (state: UIState, action: PayloadAction<Location>) => {
      state.profileSettingLastLocation = action.payload
    }
  },
});

const { actions, reducer: uiReducer } = uiSlice;

export const {
  showNavTab,
  hideNavTab,
  showConvLgRecordBtn,
  hideConvLgRecordBtn,
  showMetLgRecordBtn,
  hideMetLgRecordBtn, 
  updateTabContentTranslatedX,
  mobileLayout,
  pcLayout,
  setProfileSettingLastRoute
} = actions;

export default uiReducer;
