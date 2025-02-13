import { StyleBertVits2Setting } from "../settings/types";

export type TranslateTextRequest = {
  text: string;
  lang: string;
  target_lang: string;
  translation_mode: string;
  tts_mode: string;
  voice_id: string;
  position: number;
  dialog_id: string;
  names: string;
  contexts: string;
  prompt: string
  sys_prompt: string
};

export type CreateAudioRequest = {
  id: string;
  voice_id: string;
  tts_mode: string;
  text: string;
  target_lang: string;
  order: number
  styleBertVits2: StyleBertVits2Setting
};

export type TranslateTextResponse = {
  corrected_text: string;
  language: string;
  output: string;
  time: number;
  translated_text: string;
};

export type ReverseTranslatedTextRequest = {
  id: string;
  text: string;
  tgt_lang: string;
  sample_text: string;
  names?: string;
  contexts?: string;
};

export type CleanTranslationRequest = {
  audios: string;
}



export type CreateAudioResponse = {
  id: string;
  output: string;
};

export type SaveBlobResponse = {
  file: string;
};

export type ReverseTranslatedTextResponse = {
  id: string;
  reversed_text: string
}