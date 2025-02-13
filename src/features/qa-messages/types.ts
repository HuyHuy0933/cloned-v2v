import { TranslatedMessage } from "../meeting/types";

export type QAMessageHistoryResponse = QAMessageReceivedEvent & {
  answers: QAMessageHistoryResponse[]
}
export type QATYPE = "question" | "answer";
export type QAMessage = {
  id: string;
  meetingId: string;
  text: string;
  originText?: string;
  originLang: string;
  type: QATYPE
  userId: string;
  username: string;
  parentId?: string
  answers: QAMessage[];
  botAnswering?: boolean
};

export type QAStreamingEvent = {
  text: string;
  is_final: boolean;
  meetingId: string;
  userId: string;
};

export type QAMessageSentEvent = {
  id: string;
  originText: string;
  meetingId: string;
  userId: string;
  username: string;
  originLang: string;
  type: QATYPE;
  parentId?: string;
  translationMode: string
  stt_model?: string;
};

export type QAMessageReceivedEvent = QAMessageSentEvent & {
  originText: string;
  translatedData: Record<string, TranslatedMessage>,
}

export type QAMessageReponse = {
  result: boolean;
  qa_data: QAMessageReceivedEvent;
  bot_response: QAMessageReceivedEvent;
}


