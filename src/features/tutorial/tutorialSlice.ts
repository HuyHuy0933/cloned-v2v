import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TUTORIAL_ENUM } from "./types";

export type TutorialState = {
  name: string
};

const initialState: TutorialState = {
  name: ""
};

const tutorialSlice = createSlice({
  name: "tutorial",
  initialState,
  reducers: {
    startTutorial: (state: TutorialState, action: PayloadAction<TUTORIAL_ENUM>) => {
      state.name = action.payload;
    },
    endTutorial: (state: TutorialState) => {
      state.name = "";
    }
  },
});

const { actions, reducer: tutorialReducer } = tutorialSlice;

export const { startTutorial, endTutorial } = actions;

export default tutorialReducer;
