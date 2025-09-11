"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import UploadSbom from "@/components/uploadSbom";
import { sbomToNotice } from "@/utils/sbomToNotice";
import { saveNotice } from "@/utils/storage";
import { useTranslation } from "react-i18next";

export default function Landing() {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <main
      className="flex min-h-[calc(100vh-200px)] flex-col items-center pt-12"
      role="main"
      aria-label={t("aria.landing")}
    >
      <section
        className="container mx-auto flex flex-1 items-center justify-center"
        style={{ maxHeight: "calc(100vh - 56px)" }}
      >
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 rounded-2xl border p-6 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-4">
            <h1 className="text-2xl font-semibold leading-tight">
              {t("landing.headline")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("landing.subline")}
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground"
                />
                <span>{t("landing.features.import")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground"
                />
                <span>{t("landing.features.editable")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground"
                />
                <span>{t("landing.features.nocookies")}</span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-1">
              <UploadSbom
                onValid={({ data, file }) => {
                  try {
                    const notice = sbomToNotice(data, "1.0.0");
                    const base = file.name.replace(/\.(cdx\.json|spdx\.json|json|sbom)$/i, "");

                    const enriched = {
                      ...notice,
                      name: base || file.name,
                      sourceFileName: file.name,
                      createdAt: new Date().toISOString(),
                    };
                    const id = (globalThis.crypto?.randomUUID?.() ?? Date.now().toString());
                    saveNotice(id, enriched);
                    router.push(`/notice/?id=${encodeURIComponent(id)}` as Route);
                  } catch (e) {
                    console.error("Conversion failed", e);
                    alert(t("components.noticeList.alerts.convertFailed"));
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("landing.note")}
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-xl border p-4">
            <h2 className="text-base font-medium">
              {t("landing.whyTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("landing.whyText")}
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border p-3">
                <div className="font-medium">{t("landing.cards.security.title")}</div>
                <div className="text-muted-foreground">
                  {t("landing.cards.security.text")}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="font-medium">{t("landing.cards.compliance.title")}</div>
                <div className="flex flex-wrap gap-4 pt-1 text-xs">
                  <a
                    className="underline underline-offset-4"
                    href="/privacy"
                  >
                    {t("nav.privacy")}
                  </a>
                  <a
                    className="underline underline-offset-4"
                    href="/imprint"
                  >
                    {t("nav.imprint")}
                  </a>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="font-medium">{t("landing.cards.formats.title")}</div>
                <div className="text-muted-foreground">
                  {t("landing.cards.formats.text")}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="font-medium">{t("landing.cards.editing.title")}</div>
                <div className="text-muted-foreground">
                  {t("landing.cards.editing.text")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
