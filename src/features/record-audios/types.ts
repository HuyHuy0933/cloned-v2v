import { TranslationFunc } from "@/locales/messages";
import { ChatHistory } from "@/containers/ai-chatbot/AIChatMessages";
import { HighlightedData } from "../messages/types";

export enum AUDIO_STATUS_ENUM {
  UPLOADING = "uploading",
  UPLOADED = "uploaded",
  PROCESSING = "processing"
}

export enum OLD_FINE_TUNED_MODEL {
  NONE = "none", // general
  FINE_TUNED = "fined_tune", // finance
}

export enum FINE_TUNED_MODEL {
  
  GENERAL = "general",
  FINANCE = "finance",
  KURITA = "kurita",
}

export enum SUMMARY_AI_TEMPLATE {
  INTERVIEW = "interview",
  MEETING = "meeting",
  PODCAST = "podcast",
  BUSINESS = "business",
  PRESENTATION = "presentation",
  WORKSHOP = "workshop",
  DISCUSSION = "discussion",
}

export enum RECORDED_AUDIO_TYPE {
  RECORDER = "recorder",
  UPLOAD = "upload",
  MEETING = "meeting",
}

export enum MEETING_BOT_TYPE {
  NORMAL = "normal",
  TEAMS = "teams",
}

export type UploadAudioRequest = {
  startDateTime: number;
  endDateTime: number;
  duration: number;
  speakers?: string;
  gender?: string;
  age?: string;
  audio: Blob | File;
  removeNoise: boolean;
  model: string;
  type: RECORDED_AUDIO_TYPE;
  masking: boolean;
  customNames: string;
  censoredWords: string;
  location: string;
  analyze_sentiment: boolean;
  enableAISummary: boolean;
  summaryAITemplate: string;
  numSpeakers: number;
};

export type UploadAIPlatformHistoryRequest = {
  audio: Blob | File;
  title: string;
  meeting_id: string;
};

export type UpdateAudioRequest = {
  id: string;
  title?: string;
  diary?: string;
};

export type ShareRecordAudioRequest = {
  recipient: string;
  audio_permission: AUDIO_PERMISSION;
  timezone: string;
};

export type AskChatBotRequest = {
  meetingId: string;
  chatId: string;
  question: string;
  language: string;
};

export type UploadAttachmentRequest = {
  file: Blob | File;
  name: string;
  size: number;
  datetime: number;
  audio_id: string;
}

export type UploadAudioResponse = {
  id: string;
  name: string;
};

export type GetRecordAudiosResponse = {
  audio_list: GetRecordAudio[];
};

export type GetRecordAudioStatusesResponse = {
  statuses: GetRecordAudio[];
};

export type GetRecordAudioDiaryResponse = {
  data: {
    diary: GetRecordAudioDiary[];
  };
};

export type GetAudioPresignUrlResponse = {
  presign_url: string;
};

export type UploadAttachmentResponse = {
  id: string
}

export type GetRecordAudioSummary = {
  tags: string[];
  summaries: AudioSummarySection[];
  agenda: string;
  action_items: string[];
  next_steps: string[];
  questions: string[];
  summary: string;
};

export type GetRecordAudioProgress = {
  userId: string | null;
  current_progress: number;
  play_count: number;
  play_complete: boolean;
};

export type GetRecordAudio = {
  id: string;
  name: string;
  start_date_time: number;
  end_date_time: number;
  duration: number;
  status: string;
  s3_path: string;
  diary: string;
  details: GetRecordAudioSummary;
  type: RECORDED_AUDIO_TYPE;
  remove_noise: boolean;
  model: FINE_TUNED_MODEL;
  progress: GetRecordAudioProgress[];
  is_masking: boolean;
  masking_approved: boolean;
  bot_type?: MEETING_BOT_TYPE;
  participants: Record<string, Participant>;
  meeting_id: string;
  language: string;
  location: string;
  enableAISummary: boolean;
  summaryAITemplate: string;
  favorite: string[];
  attachments?: FileAttachment[]
};

export enum AUDIO_PERMISSION {
  OWNER = "owner",
  EDITOR = "editor",
  VIEWER = "viewer",
}

export type GetUsersRecordAudioShared = {
  _id: string;
  record: string;
  user_id: string;
  audio_permission: AUDIO_PERMISSION;
  user_profile: {
    email: string;
    group: string;
  };
};

export type RecordAudioStatus = {
  id: string;
  status: string;
  s3_path: string;
  name: string;
  diary: string;
  duration: number;
  details: GetRecordAudioSummary;
};

export type GetRecordAudioDiary = {
  speaker: string;
  transcript: string;
  start_time: number;
  end_time: number
  entities?: PIIEntities;
  highlights?: HighlightedData;
  is_translated?: boolean;
};

export type RecordedAudioDiary = {
  id: string;
  speaker: string;
  transcript: string;
  start_time: number;
  end_time: number;
  piiEntities?: PIIEntities;
  highlights?: HighlightedData;
  is_translated?: boolean;
};

export type PIIEntities = {
  text: string;
  entities: PIIEntity[];
};

export type PIIEntity = {
  category: string;
  confidence_score: number;
  text: string;
  offset: number;
  length: number;
};

export type RecordedAudioDiaryExt = RecordedAudioDiary & {
  tts: boolean;
};

export type AudioSummarySection = {
  key: string;
  content: string;
};

export type RecordedAudioSummary = {
  tags: string[];
  summaries: AudioSummarySection[];
};

export type Participant = {
  id: string;
  name: string;
  role: string;
};

export type RecordedAudio = {
  id: string;
  name: string;
  startDateTime: number;
  endDateTime: number;
  duration: number;
  status?: string;
  fileUrl?: string;
  diary: RecordedAudioDiary[];
  speakers: number;
  summaryDetail: RecordedAudioSummary;
  type: RECORDED_AUDIO_TYPE;
  remove_noise: boolean;
  model: FINE_TUNED_MODEL;
  progress: GetRecordAudioProgress;
  is_masking: boolean;
  masking_approved: boolean;
  bot_type?: MEETING_BOT_TYPE;
  participants: Participant[];
  meeting_id?: string;
  language?: string;
  languageAudios?: RecordedAudio[];
  location: string;
  enableAISummary: boolean;
  summaryAITemplate: string;
  favorite: string[];
  attachments?: FileAttachment[];
};

export type DateRecordAudios = Record<string, RecordedAudio[]>;

export type FinedTuneOption = {
  value: string;
  title: TranslationFunc;
};

export type SummaryTemplateOption = {
  value: string;
  title: string;
};

export type UpdateAudioProgressRequest = {
  userId: string | null;
  current_progress: number;
  play_count: number;
  play_complete: boolean;
};

export type SentimentData = {
  id: number;
  speaker: string;
  score: number;
  magnitude: number;
  sentence: string;
};

export type AIChatHistory = {
  date: number;
  recordAudioId: string;
  chatHistory: ChatHistory[];
};

export type UploadAIPlatformAgentRequest = {
  audio: Blob | File;
  recording_id: string;
  stop_time: number;
  shared_ai_platform: boolean;
};

export type TemplateDetail = {
  icon: string;
  name: string;
  title: string;
  sections: Map<string, string>;
};

export const enum SUMMARY_SECTION_KEYS {
  SECTION_1 = "section_1",
  SECTION_2 = "section_2",
  SECTION_3 = "section_3",
  SECTION_4 = "section_4",
  SECTION_5 = "section_5",
}

export type FileAttachment = {
  id: string;
  file_name: string;
  size: number;
  datetime: number;
  file_url: string;
}