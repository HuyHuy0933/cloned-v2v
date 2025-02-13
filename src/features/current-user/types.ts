import { SettingState } from "../settings/settingSlice";
import { TUTORIAL_ENUM } from "../tutorial/types";

export type SaveUserSettingRequest = {
  language?: string;
  email?: string;
  settings?: any;
};

export type TrackUserUsageRequest = {
  key: string;
  count: number;
};

export type UserTutorial = Record<string, string>

export type UserSetting = {
  language: string;
  group?: string;
  email?: string;
  settings?: SettingState
  tutorial?: UserTutorial
};

export type UserUsage = {
  custom_voice_count: number;
  custom_voice_audio_samples_count: number;
  recording_time_minutes: number;
  audio_upload_time_minutes: number;
  recording_noise_suppression_time_minutes: number;
  audio_upload_noise_suppression_time_minutes: number;
  meeting_noise_suppression_time_minutes: number;
  recording_ai_summary_tokens: number;
  audio_upload_ai_summary_tokens: number;
  meeting_ai_summary_tokens: number;
  chatbot_ai_tokens: number;
  meeting_time_minutes: number;
  meeting_stt_time_minutes: number;
  translate_stt_time_minutes: number;
  meeting_tts_time_characters: number;
  translate_tts_time_characters: number;
  meeting_voice_cloning_tts_time_characters: number;
  translate_voice_cloning_tts_time_characters: number;
  meeting_translated_characters: number;
  translate_translated_characters: number;
};

export type LimitUsage = {
  custom_voice_count: number;
  custom_voice_audio_samples_count: number;
  audio_storage_usage_time_minutes: number;
  noise_suppression_time_minutes: number;
  ai_summary_tokens: number;
  meeting_time_minutes: number;
  meeting_tts_time_minutes: number;
  stt_time_minutes: number;
  voice_cloning_tts_time_minutes: number;
  translated_characters: number;
};

export type UserMetaDataType = {
  area: string;
  branch: string;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  metadata: UserMetaDataType;
  isRecordingStrict: boolean;
};

