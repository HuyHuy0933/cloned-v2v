import { RECORDED_AUDIO_TYPE } from "../record-audios/types";
import { CustomEntity } from "../settings/types";

export type SaveRecordingMeetingRequest = {
  recording_id: string;
  removeNoise: boolean;
  model: string;
  masking: boolean;
  type: RECORDED_AUDIO_TYPE;
  location: string;
  analyze_sentiment: boolean;
  enableAISummary: boolean;
  summaryAITemplate: string;
  audio?: Blob;
};

export type CreateMeetingRecoringRequest = {
  recording_id: string;
  meetingName: string;
  userId: string;
  username: string;
  language: string;
  email: string;
  createdAt: number
  custom_entities: CustomEntity[];
  shared_ai_platform: boolean;
  censoredWords: string;
  customNames: string
  stt_mode: string
  num_speakers: number
  entity_extracted: boolean
}

export type DeleteAttachmentRequest = {
  audioId: string;
  attachmentId: string;
}

export type RecordingMessageHistory = {
  meeting_id: string;
  message_id: string;
  origin_language: string;
  origin_text: string;
  user_id: string;
  username: string;
  createdAt: number;
  entity_labels: EntityLabelIndex[];
};

export type EntityLabelIndex = {
  start: number;
  end: number;
  label: string;
  entity: string;
};

export type RecordingMessage = {
  id: string;
  text: string;
  is_final: boolean;
  userId?: string;
  username?: string;
  language: string;
  entity_labels?: EntityLabelIndex[];
  createdAt: number;
  is_whisper?: boolean;
};

export type RecordingStreamingEvent = {
  audioData: any;
  meetingId: string;
  userId: string;
  language: string;
};

export type RecordingMessageEvent = {
  meetingId: string;
  messageId: string;
  text: string;
  userId: string;
  username: string;
  language: string;
  is_final: boolean;
  entity_labels: EntityLabelIndex[];
  createdAt: number;
  is_whisper: boolean;
  whisper_data?: RecordingMessage[];
};

export type RecordingMeetingStatusEvent = {
  meetingId: string;
  status: RECORDING_STATUS_ENUM
  duration: number;
}

export type RecordingMeetingWhisperEvent = {
  meeting_id: number;
  message_id: number
  username: string;
}

export const enum ENTITY_LABEL_ENUM {
  PERSON = "PERSON",
  NORP = "NORP",
  ORG = "ORG",
  GPE = "GPE",
  LOC = "LOC",
  PRODUCT = "PRODUCT",
  EVENT = "EVENT",
  WORK_OF_ART = "WORK_OF_ART",
  LANGUAGE = "LANGUAGE",
  DATE = "DATE",
  TIME = "TIME",
  PERCENT = "PERCENT",
  MONEY = "MONEY",
  QUANTITY = "QUANTITY",
  ORDINAL = "ORDINAL",
  CARDINAL = "CARDINAL",
}

export const enum RECORDING_STATUS_ENUM {
  RECORDING = "RECORDING",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
}
