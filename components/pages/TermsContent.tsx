"use client";

import { useTranslation } from "react-i18next";

export default function TermsContent() {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">
        {t("pages.terms.title")}
      </h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {t("pages.terms.intro")}
      </p>
      <p className="mb-4 text-sm text-muted-foreground">
        {t("pages.terms.usage")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("pages.terms.changes")}
      </p>
    </>
  );
}
