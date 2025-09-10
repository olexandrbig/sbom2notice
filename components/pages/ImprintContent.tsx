"use client";

import { useTranslation } from "react-i18next";

export default function ImprintContent() {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">
        {t("pages.imprint.title")}
      </h1>

      <p className="mt-4 mb-2 text-md text-muted-foreground">
        {t("pages.imprint.operator")}
      </p>

      <p className="mb-4 text-sm text-muted-foreground">
        {t("pages.imprint.company")}
        <br />
        {t("pages.imprint.address")}
      </p>

      <p className="mt-4 mb-2 text-md text-muted-foreground">
        {t("pages.imprint.support")}
      </p>

      <p className="mb-4 text-sm text-muted-foreground">
        <a
          className="underline underline-offset-4"
          href="https://support.trustsource.io"
        >
          {t("pages.imprint.kb")}
        </a>
        <br />
        <a
          className="underline underline-offset-4"
          href="mailto:support@trustsource.io"
        >
          {t("pages.imprint.contact")}
        </a>
      </p>

      <p className="mt-4 mb-2 text-md text-muted-foreground">
        {t("pages.imprint.security")}
      </p>

      <p className="mb-4 text-sm text-muted-foreground">
        <a
          className="underline underline-offset-4"
          href="https://www.trustsource.io/en/security-policy"
        >
          {t("pages.imprint.policy")}
        </a>
        <br />
        <a
          className="underline underline-offset-4"
          href="mailto:psirt@trustsource.io"
        >
          {t("pages.imprint.contact")}
        </a>
      </p>
    </>
  );
}
