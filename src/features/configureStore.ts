import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  PersistConfig,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import settingReducer, { SettingState } from "./settings/settingSlice";
import uiReducer from "./ui/uiSlice";
import recordAudiosReducer from "./record-audios/recordAudioSlice";
import conversationReducer, {
  ConversationState,
} from "./conversation/conversationSlice";
import meetingReducer from "./meeting/meetingSlice";
import deviceReducer from "./devices/deviceSlice";
import tutorialReducer from "./tutorial/tutorialSlice";

const settingPersistConfig: PersistConfig<SettingState> = {
  key: "setting",
  storage,
  blacklist: ["dialogId"],
  migrate: async (state: any) => {
    if (state && state.recorderMeeting) {
      return {
        ...state,
        recorderMeeting: {
          ...state.recorderMeeting,
          customEntities: state.recorderMeeting.customEntities || [],
        },
      };
    }
    return state;
  },
};

const conversationPersistConfig: PersistConfig<ConversationState> = {
  key: "conversation",
  storage,
  whitelist: ["messages"],
};

const rootReducer = combineReducers({
  setting: settingReducer,
  conversation: conversationReducer,
  ui: uiReducer,
  recordAudios: recordAudiosReducer,
  meeting: meetingReducer,
  device: deviceReducer,
  tutorial: tutorialReducer,
});

export default function configureAppStore() {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
    devTools: process.env.NODE_ENV !== "production",
    // preloadedState,
    // enhancers: [monitorReducersEnhancer]
  });
  const persistor = persistStore(store);

  return { store, persistor };
}
