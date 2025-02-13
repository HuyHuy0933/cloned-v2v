
export const enum HIGHLIGHT_TYPE_ENUM {
  CHECK = "✅",
  ERROR = "⛔",
  WARNING = "⚠️",
}

export type MessageEmoji = {
  name: string;
  userIds: string[];
};

export type ReplyMessage = Message & {
  parent_id: string;
  userId: string;
  username: string;
};

export type ActiveUserCenterMsg = {
  username: string;
  status: boolean;
};

export type CenterData = {
  activeUser?: ActiveUserCenterMsg;
};

export type HighlightedData = {
  origins: HighlightedRange[];
  translations: Record<string, HighlightedRange[]>;
}

export type HighlightedRange = {
  start: number;
  end: number;
  // annotator: HIGHLIGHT_TYPE_ENUM;
};

export type Message = {
  id: string;
  originTexts: string[];
  correctedTexts: string[];
  audios?: Blob[];
  translatedTexts: string[];
  translatedAudios: string[][];
  reversedTexts?: string[];
  originLang: string;
  targetLang: string;
  voiceId?: string;
  speakerPosition?: "left" | "right";
  isTranslating?: boolean;
  completed?: boolean;
  userId?: string;
  username?: string;
  translatedAudioDuration?: number;
  emojis?: MessageEmoji[];
  replies?: ReplyMessage[];
  createdAt: number;
  noTranslatedData?: boolean;
  centerData?: CenterData;
  userConsecMessages?: Message[];
  highlights?: HighlightedData;
};
