"use client";

import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en/common.json";
import de from "@/locales/de/common.json";

let _i18n: I18nInstance | null = null;

export function getI18n(): I18nInstance {
  if (_i18n) return _i18n;
  _i18n = i18next.createInstance();
  _i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    debug: false,
    resources: {
      en: { common: en },
      de: { common: de }
    },
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false }
  });
  return _i18n;
}
