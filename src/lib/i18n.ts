import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationKO from "@/locales/ko/translation.json";
import translationEN from "@/locales/en/translation.json";

/**
 * i18n Configuration
 *
 * 다국어 지원을 위한 react-i18next 설정
 * - 한국어(ko), 영어(en) 지원
 * - 브라우저 언어 자동 감지
 * - LocalStorage에 선택 언어 저장
 *
 * @see ProductRequirements.md - US-7.1
 */

const resources = {
  ko: {
    translation: translationKO,
  },
  en: {
    translation: translationEN,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ko",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
