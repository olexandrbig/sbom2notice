"use client";

import { useTranslation } from "react-i18next";

export default function PrivacyContent() {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">
        {t("pages.privacy.title")}
      </h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {t("pages.privacy.intro")}
      </p>
      <p className="mb-4 text-sm text-muted-foreground">
        {t("pages.privacy.nocookies")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("pages.privacy.questions")}
        <a
          className="underline underline-offset-4 ml-2"
          href="mailto:support@trustsource.io"
        >
          {t("pages.privacy.contact")}
        </a>
      </p>
    </>
  );
}
