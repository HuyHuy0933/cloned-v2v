import USFlag from "@/assets/icons/country-flags/us.svg";
import JPFlag from "@/assets/icons/country-flags/jp.svg";
import VNFlag from "@/assets/icons/country-flags/vn.svg";
import CNFlag from "@/assets/icons/country-flags/cn.svg";
import AEFlag from "@/assets/icons/country-flags/ae.svg";
import DEFlag from "@/assets/icons/country-flags/de.svg";
import FRFlag from "@/assets/icons/country-flags/fr.svg";
import KRFlag from "@/assets/icons/country-flags/kr.svg";
import ITFlag from "@/assets/icons/country-flags/it.svg";
import ESFlag from "@/assets/icons/country-flags/es.svg";
import RUFlag from "@/assets/icons/country-flags/ru.svg";
import INFlag from "@/assets/icons/country-flags/in.svg";
import THFlag from "@/assets/icons/country-flags/th.svg";
import { tMessages, TranslationFunc } from "@/locales/messages";

export type LanguageOption = {
  code: string;
  flagUrl: string;
  localTitle: string;
  title: TranslationFunc;
};

export type Emoji = {
  name: string;
  code: string;
};

export const allLanguages: LanguageOption[] = [
  {
    code: "en-US",
    localTitle: "English",
    flagUrl: USFlag,
    title: tMessages.language.en_US,
  },
  {
    code: "ja-JP",
    localTitle: "日本語",
    flagUrl: JPFlag,
    title: tMessages.language.ja_JP,
  },
  {
    code: "vi-VN",
    localTitle: "Tiếng Việt",
    flagUrl: VNFlag,
    title: tMessages.language.vi_VN,
  },
  {
    code: "zh-CN",
    localTitle: "中文",
    flagUrl: CNFlag,
    title: tMessages.language.zh_CN,
  },
  {
    code: "de-DE",
    localTitle: "Deutsch",
    flagUrl: DEFlag,
    title: tMessages.language.de_DE,
  },
  {
    code: "fr-FR",
    localTitle: "Français",
    flagUrl: FRFlag,
    title: tMessages.language.fr_FR,
  },
  {
    code: "ko-KR",
    localTitle: "한국인",
    flagUrl: KRFlag,
    title: tMessages.language.ko_KR,
  },
  {
    code: "it-IT",
    localTitle: "Italiano",
    flagUrl: ITFlag,
    title: tMessages.language.it_IT,
  },
  {
    code: "es-ES",
    localTitle: "Español",
    flagUrl: ESFlag,
    title: tMessages.language.es_ES,
  },
  {
    code: "ru-RU",
    localTitle: "Россия",
    flagUrl: RUFlag,
    title: tMessages.language.ru_RU,
  },
  {
    code: "hi-IN",
    localTitle: "हिंदी",
    flagUrl: INFlag,
    title: tMessages.language.hi_IN,
  },
  {
    code: "th-TH",
    localTitle: "แบบไทย",
    flagUrl: THFlag,
    title: tMessages.language.th_TH,
  },
  {
    code: "ar-SA",
    localTitle: "العربية",
    flagUrl: AEFlag,
    title: tMessages.language.ar_SA,
  },
];

export const flagIcon: Record<LanguageOption["code"], string> = {};
allLanguages.forEach((x) => (flagIcon[x.code] = x.flagUrl));

export const DEFAULT_STALE_TIME_QUERY = 5 * 60 * 1000;
export const QUERY_KEY = {
  CURRENT_USER: "current_user",
  USER_USAGE: "user_usage",
  USER_SETTINGS: "user_settings",
  ELEVENTLAB_VOICES: "elevenlabs_voices",
  VOICE_DETAIL: "voice_detail",
  MY_VOICE: "my_voice",
  SAMPLE_PRESIGN_URL: "sample_presign_url",
  RECORD_AUDIOS: "record_audios",
  RECORD_AUDIO_DETAIL: "record_audio_detail",
  USERS_RECORD_AUDIO_SHARED: "users_record_audio_shared",
  RECORD_AUDIOS_STATUS: "record_audios_status",
  AUDIO_PRESIGN_URL: "audio_presign_url",
  MEETING_ROOM: "meeting_room",
  MEETING_USERS: "meeting_users",
  MEETING_LIST: "meeting_list",
  MEETING_DETAIL: "meeting_detail",
  MEETING_SINGLE: "meeting_single",
  MEETING_QA_HISTORIES: "meeting_qa_histories",
  MEETING_QA_HISTORIES_OFFLINE: "meeting_qa_histories_offline",
  MEETING_TRANSLATED_DATA: "meeting_translated_data",
  MEETING_TEAMS_PARTICIPANTS: "meeting_teams_users",
  RECORDING_MEETING: "recording_meeting",
  RECORDING_HISTORIES: "recording_histories",
  SENTIMENT_DATA: "sentiment_data",
  AICHAT_HISTORY: "aichat_history",
  WERCER_HISTORY: "wercer_history",
  ATTACHMENT_PRESIGN_URL: "attachment_presign_url",
};
export const DEFAULT_USER_PROMPT = `Correct the following transcription, focusing on proper custom names and terms, and homophones:\n"{raw_transcript}"\n{context_str}.\nIf the transcription is already correct or you cannot correct it, please confirm: "{raw_transcript}".\nIf there is any error happened during correction, please confirm: "{raw_transcript}".\nDon't add additional sentences, and don't automatically add the context to the corrected transcription.\nI need your response to this request in the fastest way to make the real-time application.\nYou don't need to explain anything about this request to me.\nIn case you need my confirmation or more custom names and terms, just ignore it and confirm "{raw_transcript}".\nThe corrected transcription must be in {Lang_mapper(language)} and in the first line.\nTranslate the corrected transcription into {Lang_mapper(target_lang)} and put it in the second line.\nCorrected transcription:\nTranslated transcription:`;
export const DEFAULT_SYSTEM_PROMPT =
  "You're an assistant designed to help proofread transcripts from recorded conversations.\nThe user will provide a transcript for proofreading.\nRemove any incorrect grammar or misspellings while keeping the transcript as accurate to the original as possible.\nRespond only with the corrected version of the transcript.";
export const JAPANESE_DATE_FORMAT = "yoMMMdo";
export const JAPANESE_DATETIME_FORMAT = "yoMMMdo HH:mm";
export const isAndroid = /Android/i.test(navigator.userAgent);
export const isDesktop =
  !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
export const DRAG_LEFT_CONSTRAINTS = -60;

export const emojiMap: Record<string, string> = {
  thumb_up: "👍",
  thumb_down: "👎",
  hand: "✋",
  question: "❓",
  check: "✔️",
  refresh: "🔄",
};
export const emojis: Emoji[] = Object.keys(emojiMap).map((x) => ({
  name: x,
  code: emojiMap[x],
}));

export enum LOCAL_STORAGE_KEY {
  user_id = "user_id",
  redirect_to = "redirect_to",
}
