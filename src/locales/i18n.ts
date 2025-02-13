import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en-US/translation.json";
import ja from "./ja-JP/translation.json";
import vi from "./vi-VN/translation.json";
import zh from "./zh-CN/translation.json";
import de from "./de-DE/translation.json";
import fr from "./fr-FR/translation.json";
import ko from "./ko-KR/translation.json";
import it from "./it-IT/translation.json";
import es from "./es-ES/translation.json";
import ru from "./ru-RU/translation.json";
import hi from "./hi-IN/translation.json";
import th from "./th-TH/translation.json";
import ar from "./ar-SA/translation.json";  
import { convertLanguageJsonToObject } from "./translations";
import LanguageDetector from "i18next-browser-languagedetector";
// import Backend from "i18next-http-backend";

export const translationsJson = {
  "en-US": {
    translation: en,
  },
  "ja-JP": {
    translation: ja,
  },
  "vi-VN": {
    translation: vi,
  },
  "zh-CN": {
    translation: zh,
  },
  "de-DE": {
    translation: de,
  },
  "fr-FR": {
    translation: fr,
  },
  "ko-KR": {
    translation: ko,
  },
  "it-IT": {
    translation: it,
  },
  "es-ES": {
    translation: es,
  },
  "ru-RU": {
    translation: ru,
  },
  "hi-IN": {
    translation: hi,
  },
  "th-TH": {
    translation: th,
  },
  "ar-SA": {
    translation: ar,
  },
};

// Create the 'translations' object to provide full intellisense support for the static json files.
convertLanguageJsonToObject(translationsJson["ja-JP"].translation);

// function to change language
// i18n.changeLanguage('en');

export const i18n = i18next
  // .use(Backend)
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources: translationsJson,
    fallbackLng: "ja-JP",
    debug: process.env.NODE_ENV !== "production",
    interpolation: {
      escapeValue: false,
    },
    // supportedLngs: ["en-US", "ja-JP", "vi-VN", "zh-CN", "de-DE", "fr-FR", "ko-KR"],
    // backend: {
    //   loadPath: "/locales/{{lng}}/translation.json", // Path to translation files,
    // },
    // nonExplicitSupportedLngs: true,
  });
