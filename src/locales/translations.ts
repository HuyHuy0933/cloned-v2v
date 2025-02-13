// @ts-nocheck
import { ConvertedToObjectType, TranslationJsonType } from './types';

/**
 * This file is seperate from the './i18n.ts' simply to make the Hot Module Replacement work seamlessly.
 * Your components can import this file in 'messages.ts' files which would ruin the HMR if this isn't a separate module
 */

export const translations: ConvertedToObjectType<TranslationJsonType> =
  {} as any;

/*
 * Converts the static JSON file into an object where keys are identical
 * but values are strings concatenated according to syntax.
 * This is helpful when using the JSON file keys and still having the intellisense support
 * along with type-safety
 */

export const convertLanguageJsonToObject = (
  json: any,
  objToConvertTo = translations,
  current?: string,
) => {
  Object.keys(json).forEach((key) => {
    const currentLookupKey = current ? `${current}.${key}` : key;
    if (typeof json[key] === 'object') {
      objToConvertTo[key] = {};
      convertLanguageJsonToObject(
        json[key],
        objToConvertTo[key],
        currentLookupKey,
      );
    } else {
      objToConvertTo[key] = currentLookupKey;
    }
  });
};

/**
 * This function has two roles:
 * 1) If the `id` is empty it assings something so does i18next doesn't throw error. Typescript should prevent this anyway
 * 2) It has a hand-picked name `_t` (to be short) and should only be used while using objects instead of strings for translation keys
 * `internals/extractMessages/stringfyTranslations.js` script converts this to `t('a.b.c')` style before `i18next-scanner` scans the file contents
 * so that our json objects can also be recognized by the scanner.
 */
const _t = (id: string, ...rest: any[]): [string, ...any[]] => {
  if (!id) {
    id = '_NOT_TRANSLATED_';
  }
  return [id, ...rest];
};
