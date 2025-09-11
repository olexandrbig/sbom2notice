"use client";

import { I18nextProvider } from "react-i18next";
import { getI18n } from "./config";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const i18n = getI18n();
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
