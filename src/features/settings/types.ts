import { TranslationFunc } from "@/locales/messages";
import { ReactNode } from "react";

export enum STYLE_BERT_VITS_EMOTION {
  Neutral = "Neutral",
  Angry = "Angry",
  Disgust = "Disgust",
  Fear = "Fear",
  Happy = "Happy",
  Sad = "Sad",
  Surprise = "Surprise",
}

export enum STYLE_BERT_VITS_GENDER {
  Male = 1,
  Female = 0,
}

export enum TTS_CLONED_MODE {
  GOOGLE = "google",
  ELEVENLABS_CLONED = "elevenlabs",
  ELEVENLABS_NO_CLONED = "no_cloned_elevenlabs",
  STYLE_BERT_VITS2 = "style_bert_vits2",
}

export enum STT_MODE {
  WEB_SPEECH = "web_speech",
  AZURE = "azure",
  MANUFACTURING = "manufacturing",
  // WHISPER = "whisper",
}

export enum TRANSLATION_MODE {
  ONLINE = "online",
  AZURE_OPENAI = "azure_openai",
  GEMINI = "gemini",
}
export type SpeakerClonedVoice = {
  id: string;
  name: string;
  silentThresholdSec: number;
  prevSilentThresholdSec: number;
};

export type OptionItem = {
  title: string | TranslationFunc;
  value: string;
  icon?: ReactNode
}

export type StyleBertVits2Setting = {
  speed: number;
  style: STYLE_BERT_VITS_EMOTION;
  gender: STYLE_BERT_VITS_GENDER;
  tone: number;
  pitchScale: number;
  intonationScale: number;
};

export type CustomEntity = {
  entity: string;
  values: string[];
}

export type RecorderMeeting = {
  entityExtraction: boolean;
  transcriptSharing: boolean;
  speakerSegment: boolean;
  customEntities: CustomEntity[];
};

export type PiiCategory = {
  key: string;
  category: string | null;
};
