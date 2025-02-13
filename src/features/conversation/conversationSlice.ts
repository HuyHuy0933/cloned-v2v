import { RecorderItem } from "@/containers/conversation/Conversation";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LEFT_POSITION, RIGHT_POSITION } from "../settings/settingSlice";
import { Message } from "../messages/types";
import { allLanguages } from "@/lib/constaints";

export type ConversationState = {
  messages: Message[];
  faceToFaceMode: boolean;
  leftRecorder: RecorderItem;
  rightRecorder: RecorderItem;
};

const initialState: ConversationState = {
  messages: [],
  faceToFaceMode: false,
  leftRecorder: {
    language: allLanguages[1].code,
    position: LEFT_POSITION,
  },
  rightRecorder: {
    language: allLanguages[0].code,
    position: RIGHT_POSITION,
  },
};

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setConversationMessages: (
      state: ConversationState,
      action: PayloadAction<Message[]>,
    ) => {
      state.messages = action.payload;
    },
    updateConversationMessage: (
      state: ConversationState,
      action: PayloadAction<Partial<Message>>,
    ) => {
      const updatedData = action.payload;
      const message = state.messages.find((x) => x.id === updatedData.id);
      if (!message) return;

      if (updatedData.originTexts) {
        message.originTexts = updatedData.originTexts;
      }
      if (updatedData.correctedTexts) {
        message.correctedTexts = updatedData.correctedTexts;
      }
      if (updatedData.translatedTexts) {
        message.translatedTexts = updatedData.translatedTexts;
      }
      if (updatedData.translatedAudios) {
        message.translatedAudios = updatedData.translatedAudios;
      }
      if (updatedData.reversedTexts) {
        message.reversedTexts = updatedData.reversedTexts;
      }
      message.completed = true;
    },
    addConversationMessage: (
      state: ConversationState,
      action: PayloadAction<Message>,
    ) => {
      action.payload.completed = true;
      state.messages.push(action.payload);
    },
    toggleFaceToFaceMode: (state: ConversationState) => {
      state.faceToFaceMode = !state.faceToFaceMode;
    },
    updateRecorder(
      state: ConversationState,
      action: PayloadAction<RecorderItem>,
    ) {
      if (action.payload.position === LEFT_POSITION) {
        state.leftRecorder = action.payload;
      } else {
        state.rightRecorder = action.payload;
      }
    },
  },
});

const { actions, reducer: conversationReducer } = conversationSlice;

export const {
  setConversationMessages,
  updateConversationMessage,
  addConversationMessage,
  toggleFaceToFaceMode,
  updateRecorder,
} = actions;

export default conversationReducer;
