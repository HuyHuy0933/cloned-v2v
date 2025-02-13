export const enum WERCER_TOKEN_TYPE {
  EQUAL = "equal",
  SUBSTITUTE = "substitute",
  INSERT = "insert",
  DELETE = "delete",
}
export type ProcessWERCERRequest = {
  datetime: number;
  microphone: string;
  language: string;
  origin_text: string;
  hypothesis_text: string;
};

export type WERCERResult = {
  accuracy: number;
  deletions: number;
  hits: number;
  insertions: number;
  substitutions: number;
  tokens: WERCERResultToken[];
  wer: number;
  words: number;
};

export type WERCERResultToken = {
  text: string[];
  type: string;
};

export type WERCERResultColumn = {
  item: string;
  value: string | number;
};

export type WERCERLegendColumn = {
  item: string;
  desc?: string;
  value: string | number;
};

export type WERCERHistory = {
  accuracy: number;
  datetime: number;
  language: number;
  microphone: number;
  totalWords: number;
  type: string
}
