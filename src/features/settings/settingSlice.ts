import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_PROMPT } from "@/lib/constaints";
import {
  CustomEntity,
  OptionItem,
  PiiCategory,
  RecorderMeeting,
  SpeakerClonedVoice,
  STT_MODE,
  STYLE_BERT_VITS_EMOTION,
  STYLE_BERT_VITS_GENDER,
  StyleBertVits2Setting,
  TRANSLATION_MODE,
  TTS_CLONED_MODE,
} from "./types";
import { ElevenLabsVoice } from "../cloned-voices/types";
import { tMessages } from "@/locales/messages";

export type SettingState = {
  translationMode: string;
  ttsMode: string;
  autoPlay: boolean;
  isReversedText: boolean;
  customNames: string;
  contexts: string;
  dialogId: string;
  prompt: string;
  systemPrompt: string;
  leftVoice: SpeakerClonedVoice;
  rightVoice: SpeakerClonedVoice;
  sttMode: string;
  realtimeMeetingMode: boolean;
  censoredWords: string;
  meetingVoice: SpeakerClonedVoice;
  styleBertVits2: StyleBertVits2Setting;
  recorderMeeting: RecorderMeeting;
  customWordsSttV2: string;
  piiCategories: PiiCategory[];
};

export const LEFT_POSITION = "left";
export const RIGHT_POSITION = "right";

export const ttsModeOptions: OptionItem[] = [
  {
    value: TTS_CLONED_MODE.GOOGLE,
    title: tMessages.common.ttsNoClonedV1,
  },
  {
    value: TTS_CLONED_MODE.ELEVENLABS_NO_CLONED,
    title: tMessages.common.ttsNoClonedV2,
  },
  {
    value: TTS_CLONED_MODE.STYLE_BERT_VITS2,
    title: tMessages.common.ttsNoClonedJPOnly,
  },
  {
    value: TTS_CLONED_MODE.ELEVENLABS_CLONED,
    title: tMessages.common.ttsCloned,
  },
];

export const translationOptions: OptionItem[] = [
  {
    value: TRANSLATION_MODE.ONLINE,
    title: tMessages.common.translationOnly,
  },
  {
    value: TRANSLATION_MODE.AZURE_OPENAI,
    title: tMessages.common.openAITranslation,
  },

  {
    value: TRANSLATION_MODE.GEMINI,
    title: tMessages.common.geminiTranslation,
  },
];

export const sttModeOptions: OptionItem[] = [
  {
    value: STT_MODE.WEB_SPEECH,
    title: tMessages.common.sttV1,
  },
  {
    value: STT_MODE.AZURE,
    title: tMessages.common.sttV2,
  },
  {
    value: STT_MODE.MANUFACTURING,
    title: tMessages.common.sttV3,
  },
];

export const realtimeMeetingOptions: OptionItem[] = [
  {
    title: tMessages.common.meetingTTSPlayWhileSpeaking,
    value: "true",
  },
  {
    title: tMessages.common.meetingTTSPlayAfterSpeaking,
    value: "false",
  },
];

export const autoPlayOptions: OptionItem[] = [
  {
    title: tMessages.common.autoPlay,
    value: "true",
  },
  {
    title: tMessages.common.notAutoPlay,
    value: "false",
  },
];

export const reverseOptions: OptionItem[] = [
  {
    title: tMessages.common.backTranslate,
    value: "true",
  },
  {
    title: tMessages.common.notBackTranslate,
    value: "false",
  },
];

export const emotionOptions: OptionItem[] = [
  { title: tMessages.common.neutral, value: STYLE_BERT_VITS_EMOTION.Neutral },
  { title: tMessages.common.anger, value: STYLE_BERT_VITS_EMOTION.Angry },
  { title: tMessages.common.disgust, value: STYLE_BERT_VITS_EMOTION.Disgust },
  { title: tMessages.common.fear, value: STYLE_BERT_VITS_EMOTION.Fear },
  { title: tMessages.common.happy, value: STYLE_BERT_VITS_EMOTION.Happy },
  { title: tMessages.common.sad, value: STYLE_BERT_VITS_EMOTION.Sad },
  { title: tMessages.common.surprise, value: STYLE_BERT_VITS_EMOTION.Surprise },
];

export const genderOptions: OptionItem[] = [
  {
    title: tMessages.common.male,
    value: STYLE_BERT_VITS_GENDER.Male.toString(),
  },
  {
    title: tMessages.common.female,
    value: STYLE_BERT_VITS_GENDER.Female.toString(),
  },
];

export const initialState: SettingState = {
  translationMode: translationOptions[0].value,
  ttsMode: ttsModeOptions[1].value,
  autoPlay: true,
  isReversedText: false,
  customNames: "",
  contexts: "",
  dialogId: uuidv4(),
  prompt: DEFAULT_USER_PROMPT,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  leftVoice: {
    id: "",
    name: "",
    silentThresholdSec: 0.1,
    prevSilentThresholdSec: 0.1,
  },
  rightVoice: {
    id: "",
    name: "",
    silentThresholdSec: 0.1,
    prevSilentThresholdSec: 0.1,
  },
  sttMode: sttModeOptions[1].value,
  realtimeMeetingMode: true,
  censoredWords: "",
  meetingVoice: {
    id: "",
    name: "",
    silentThresholdSec: 0.1,
    prevSilentThresholdSec: 0.1,
  },
  styleBertVits2: {
    speed: 1,
    style: STYLE_BERT_VITS_EMOTION.Neutral,
    gender: STYLE_BERT_VITS_GENDER.Male,
    tone: 0,
    pitchScale: 1,
    intonationScale: 1,
  },
  recorderMeeting: {
    entityExtraction: true,
    transcriptSharing: true,
    speakerSegment: false,
    customEntities: [
      {
        entity: "",
        values: [],
      },
    ],
  },
  customWordsSttV2: "",
  piiCategories: []
};

const settingSlice = createSlice({
  name: "setting",
  initialState: initialState,
  reducers: {
    setSetting: (_, action: PayloadAction<SettingState>) => {
      return action.payload;
    },
    setElevenLabsVoice: (
      state: SettingState,
      action: PayloadAction<ElevenLabsVoice>,
    ) => {
      state.leftVoice = {
        ...state.leftVoice,
        id: action.payload.id,
        name: action.payload.name,
      };
      state.rightVoice = {
        ...state.rightVoice,
        id: action.payload.id,
        name: action.payload.name,
      };
      state.meetingVoice = {
        ...state.rightVoice,
        id: action.payload.id,
        name: action.payload.name,
      };
    },
    setCustomNames: (state: SettingState, action: PayloadAction<string>) => {
      if (state.customNames !== action.payload) {
        state.dialogId = uuidv4();
      }
      state.customNames = action.payload;
    },
    setContexts: (state: SettingState, action: PayloadAction<string>) => {
      if (state.contexts !== action.payload) {
        state.dialogId = uuidv4();
      }
      state.contexts = action.payload;
    },
    setTTSMode: (state: SettingState, action: PayloadAction<string>) => {
      state.ttsMode = action.payload;
    },
    toggleAutoPlay: (state: SettingState, action: PayloadAction<boolean>) => {
      state.autoPlay = action.payload;
    },
    toggleReverseText: (
      state: SettingState,
      action: PayloadAction<boolean>,
    ) => {
      state.isReversedText = action.payload;
    },
    setTranslationMode: (
      state: SettingState,
      action: PayloadAction<string>,
    ) => {
      state.translationMode = action.payload;
    },
    setPrompt: (state: SettingState, action: PayloadAction<string>) => {
      state.prompt = action.payload;
    },
    setSystemPrompt: (state: SettingState, action: PayloadAction<string>) => {
      state.systemPrompt = action.payload;
    },
    setLeftVoice: (
      state: SettingState,
      action: PayloadAction<Partial<SpeakerClonedVoice>>,
    ) => {
      state.leftVoice = {
        ...state.leftVoice,
        ...action.payload,
      };
    },
    setRightVoice: (
      state: SettingState,
      action: PayloadAction<Partial<SpeakerClonedVoice>>,
    ) => {
      state.rightVoice = {
        ...state.rightVoice,
        ...action.payload,
      };
    },
    setSTTMode: (state: SettingState, action: PayloadAction<string>) => {
      state.sttMode = action.payload;
    },
    setRealtimeMeetingMode: (
      state: SettingState,
      action: PayloadAction<boolean>,
    ) => {
      state.realtimeMeetingMode = action.payload;
    },
    setCensoredWords: (state: SettingState, action: PayloadAction<string>) => {
      state.censoredWords = action.payload;
    },
    setMeetingVoice: (
      state: SettingState,
      action: PayloadAction<Partial<SpeakerClonedVoice>>,
    ) => {
      state.meetingVoice = {
        ...state.meetingVoice,
        ...action.payload,
      };
    },
    setStyleBertVits2: (
      state: SettingState,
      action: PayloadAction<Partial<StyleBertVits2Setting>>,
    ) => {
      state.styleBertVits2 = {
        ...state.styleBertVits2,
        ...action.payload,
      };
    },
    setCustomWordsSttV2: (
      state: SettingState,
      action: PayloadAction<string>,
    ) => {
      state.customWordsSttV2 = action.payload;
    },
    resetSetting: (state: SettingState) => {
      state.sttMode = initialState.sttMode;
      state.ttsMode = initialState.ttsMode;
      state.translationMode = initialState.translationMode;
      state.realtimeMeetingMode = initialState.realtimeMeetingMode;
      state.autoPlay = initialState.autoPlay;
      state.isReversedText = initialState.isReversedText;
      state.meetingVoice.silentThresholdSec =
        initialState.meetingVoice.silentThresholdSec;
      state.leftVoice.silentThresholdSec =
        initialState.leftVoice.silentThresholdSec;
      state.rightVoice.silentThresholdSec =
        initialState.rightVoice.silentThresholdSec;
      state.recorderMeeting = initialState.recorderMeeting;
      state.censoredWords = initialState.censoredWords;
      state.customWordsSttV2 = initialState.customWordsSttV2;
      state.styleBertVits2 = initialState.styleBertVits2;
    },
    setRecorderMeeting: (
      state: SettingState,
      action: PayloadAction<Partial<RecorderMeeting>>,
    ) => {
      state.recorderMeeting = {
        ...state.recorderMeeting,
        ...action.payload,
      };
    },
    setCustomEntities: (
      state: SettingState,
      action: PayloadAction<CustomEntity[]>,
    ) => {
      state.recorderMeeting.customEntities = action.payload;
    },
    setPiiCategories: (
      state: SettingState,
      action: PayloadAction<PiiCategory[]>,
    ) => {
      state.piiCategories = action.payload;
    },
  },
});

const { actions, reducer: settingReducer } = settingSlice;

export const {
  setElevenLabsVoice,
  setCustomNames,
  setContexts,
  setTTSMode,
  toggleAutoPlay,
  setTranslationMode,
  toggleReverseText,
  setPrompt,
  setLeftVoice,
  setRightVoice,
  setSystemPrompt,
  setSTTMode,
  setRealtimeMeetingMode,
  setCensoredWords,
  setMeetingVoice,
  setStyleBertVits2,
  resetSetting,
  setRecorderMeeting,
  setCustomWordsSttV2,
  setCustomEntities,
  setPiiCategories,
  setSetting
} = actions;

export default settingReducer;
