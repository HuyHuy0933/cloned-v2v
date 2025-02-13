import { createSlice } from "@reduxjs/toolkit";

export type RecordAudiosState = {
  // audios: RecordedAudio[];
};

const initialState: RecordAudiosState = {
  audios: [],
};

const recordAudiosSlice = createSlice({
  name: "recordAudios",
  initialState,
  reducers: {
    // uploadAudio: (
    //   state: RecordAudiosState,
    //   action: PayloadAction<RecordedAudio>,
    // ) => {
    //   state.audios.unshift({
    //     ...action.payload,
    //     status: AUDIO_STATUS_ENUM.UPLOADING,
    //   });
    // },
  },
});

const { reducer: recordAudiosReducer } = recordAudiosSlice;

// export const { uploadAudio } = actions;

export default recordAudiosReducer;
