import { ReactNode } from "react";
import { TranslationFunc } from "@/locales/messages";
import { CenterData, HighlightedData } from "../messages/types";
import { EntityLabelIndex } from "../recording-meeting/types";
import { CustomEntity, StyleBertVits2Setting } from "../settings/types";

// API types
export type CreateMeetingRequest = {
  meetingId: string;
  meetingName: string;
  username?: string;
  userId?: string;
  language: string;
  createdAt: number;
  contexts?: string;
  customNames?: string;
  censoredWords?: string;
  userPrompt?: string;
  systemPrompt?: string;
  bot_url?: string;
  password?: string;
  custom_room_id?: string;
  custom_token?: string;
  remote_access?: string;
  private?: boolean;
  is_deleted?: boolean
  hidden?: boolean
  stt_model: string
};

export type SaveMeetingRequest = {
  meetingId: string
  removeNoise: boolean
  model: string
  masking: boolean
  analyze_sentiment: boolean
  enableAISummary: boolean
  summaryAITemplate: string
  numSpeakers: number
}

export type MeetingPasswordRequest = {
  id?: string, // id=meetingId
  password?: string
}

export type GetTranslatedDataRequest = {
  meetingId: string
  originText: string
  targetLang: string
  translationMode: string
  ttsMode: string
  voiceId: string;
  userId: string;
  username: string;
  messageId: string
  styleBertVits2: StyleBertVits2Setting
}

export type AddTeamsParticipantsRequest = {
  meeting_id: string;
  user_id: string;
  user_name: string;
  teams_name: string;
  language: string;
  ttsMode: string;
  voiceId: string;
}

export type VerifyCustomIdMeetingRequest = {
  custom_room_id: string;
  custom_token: string;
}

export type CreateMeetingResponse = {
  meetingId: string;
};

export type MeetingRoomResponse = {
  id: string;
  meetingName: string;
  contexts?: string;
  customNames?: string;
  password?: string;
  userPrompt?: string;
  systemPrompt?: string;
  censoredWords?: string;
  userCount?: number;
  createdAt?: number;
  bot_url?: string;
  meeting_context?: string;  
  custom_room_id?: string;
  remote_access?: string;
  private?: boolean;
  users: Record<string, MeetingUser>,
  recording_id?: string
  custom_entities?: CustomEntity[]
  entity_extracted?: boolean
}

export type LanguageChunkMessage = {
  meeting_id: string;
  message_id: string;
  chunk_index: number;
  origin_audio_path: string
  origin_language: string;
  origin_text: string;
  target_language: string;
  translated_audio_path: string;
  translated_text: string;
  user_id: string
  origin_duration: number
  translated_duration: number
  createdAt: number;
  centerData: CenterData;
  entity_labels: EntityLabelIndex[];
  username: string;
  corrected_text: string
  highlights?: HighlightedData;
}

export type GroupedMessage = {
  meeting_id: string;
  message_id: string;
  origin_texts: string[];
  origin_audio_paths: string[]
  origin_language: string;
  origin_duration: number;
  translated_audio_paths: Record<string, string[]>;
  translated_texts: Record<string, string[]>;
  translated_duration: Record<string, number>;
  user_id: string
  username: string
  createdAt: number
  centerData?: CenterData;
  corrected_texts: string[];
  highlights?: HighlightedData;
}

export type EmojiResponse = {
  emoji: string;
  user_id: string
}

export type ReplyMessageResponse = {
  id: string;
  createdAt: number;
  user_id: string;
  message: string;
  user_name: string;
}
export type ReactionDataResposne = {
  message_id: string;
  emojis: EmojiResponse[]
  messages: ReplyMessageResponse[]
}

export type ReactionsResponse = {
  meeting_id: string;
  reactions: ReactionDataResposne[]
}

export type MeetingDetailsResponse = {
  conversation: LanguageChunkMessage[]
  createdAt: number
  id: string;
  customNames: string;
  meetingName: string;
  userPrompt: string;
  systemPrompt: string;
  users: Record<string, MeetingUser>
  reactions: ReactionsResponse
  custom_entities: CustomEntity[];
  entity_extracted?: boolean
  stt_model: string;
}

export type GetTranslatedDataResponse = {
  messageId: string;
  meetingId: string;
  translatedText: Record<string, TranslatedMessage>;
  translatedAudio: string;
  translatedDuration: number
}

export type GetTeamsParticipantsResponse = {
  participants: string[]
}

// core types
export type MeetingRoom = {
  meetingId: string;
  meetingName: string;
  contexts?: string;
  customNames?: string;
  userPrompt?: string;
  systemPrompt?: string;
  censoredWords?: string;
  userCount?: number;
  users?: MeetingUser[];
  createdAt?: number;
  bot_url?: string;
  meeting_context?: string;  
  isProtected?: boolean;
  custom_room_id?: string;
  remote_access?: string;
  private?: boolean;
  recording_id?: string;
  custom_entities?: CustomEntity[];
  main_user?: MeetingUser
};

export type MeetingUser = {
  userId: string;
  email: string;
  username: string;
  language: string;
  role?: string;
  isSpeaking?: boolean;
  speakingDurationTime?: number;
  startSpeakingTime?: number;
  left?: boolean // passive of leave
  teams_name?: string
};

export type ComputedMeetingUser = MeetingUser & {
  isNextSpeaker?: boolean;
};

export type MeetingUserRole = {
  title: TranslationFunc;
  value: string;
  icon?: ReactNode;
};

export type TranslatedMessage = {
  text: string;
};

export type AudioData = {
  path: string; // processed audio path
  language: string; // processed audio language 
  origin_audio: string; // speaker's audio path
  origin_language: string // speaker's language
  origin_duration: number; 
  translated_duration: number;
  translated_audio_data: any // processed audio base64 string
};

// socket event types
export type JoinMeetingEvent = {
  meetingId: string;
  userId: string;
  email: string;
  username: string;
  language: string;
  role?: string;
};

export type LeaveMeetingEvent = {
  meetingId: string;
  userId: string;
  removeMeeting?: boolean
  language: string
  user: Partial<MeetingUser>
  stt_model: string
};

export type StartSpeakingEvent = {
  meetingId: string;
  messageId: string;
  user: MeetingUser;
};

export type StopSpeakingEvent = {
  meetingId: string;
  user: MeetingUser;
  stt_model: string;
};

export type AddNextSpeakersQueueEvent = {
  meetingId: string;
  userId: string;
};

export type SendMessageEvent = {
  meetingId: string;
  userId: string;
  username: string;
  email: string
  messageId: string;
  chunkIndex: number;
  originText: string;
  correctedText?: string;
  translatedText?: string;
  originLang: string;
  voiceId?: string;
  ttsMode?: string;
  translationMode?: string;
  speaking?: boolean; // used by backend, transfer message to other clients without translating when true
  translatedData?: Record<string, TranslatedMessage>; // key is language code
  audioData?: AudioData;
  originChunk?: Int16Array; // used by backend, if exists then dont need generate audio if same lanaguage
  editted?: boolean
  createdAt: number
  styleBertVits2?: StyleBertVits2Setting;
  centerData?: CenterData;
};

export type DisconnectEvent = {
  userId: string;
};

export type ReplyMessageEvent = {
  id: string
  message: string;
  createdAt: number
}



export type UpdateMessageEvent = {
  meeting_id: string
  message_id: string;
  user_id: string;
  username: string;
  originText?: string
  translatedText?: string
  emoji?: string
  reply?: ReplyMessageEvent
  highlights?: HighlightedData
}

export type BotTeamsRaiseHandUsersEvent = {
  meetingId: string;
  userIds: string[]
};


export type BotTeamsRaiseUnmuteCountEvent = {
  meetingId: string;
  more_than_1: boolean;
};

export type StreamingEvent = {
  audioData: any
  meetingId?: string;
  userId?: string;
  language: string;
  user: {
    userId: string;
    language: string
  }
}
