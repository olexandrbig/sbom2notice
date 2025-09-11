"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loadNotice } from "@/utils/storage";
import type { NoticeDoc } from "@/types/notice";
import { Check, Copy, FileDown, FileText, Table } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type State = "loading" | "ready" | "missing";

export default function NoticeViewer({ id }: { id: string }) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [state, setState] = useState<State>("loading");
  const [doc, setDoc] = useState<NoticeDoc | null>(null);
  const [copied, setCopied] = useState(false);
  const copyT = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    const MIN_DELAY = 200;
    const start = performance.now();

    const run = () => {
      const loaded = loadNotice(id);
      if (!alive) return;
      setDoc(loaded);
      const elapsed = performance.now() - start;
      const finish = () => setState(loaded ? "ready" : "missing");
      elapsed < MIN_DELAY ? window.setTimeout(finish, MIN_DELAY - elapsed) : finish();
    };

    queueMicrotask(run);
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    return () => { if (copyT.current) window.clearTimeout(copyT.current); };
  }, []);

  const jsonPretty = useMemo(() => (doc ? JSON.stringify(doc, null, 2) : ""), [doc]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonPretty);
    setCopied(true);
    copyT.current = window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadBlob = (data: string, filename: string, mime: string) => {
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const csvEscape = (v: unknown) => {
    const s = String(v ?? "");
    const needsQuotes = /[",\n;]/.test(s);
    const esc = s.replace(/"/g, '""');
    return needsQuotes ? `"${esc}"` : esc;
  };

  const toCSV = (d: NoticeDoc) => {
    const rows: string[] = [];
    const header = [
      "licenseId","licenseName","licenseTextPresent",
      "componentName","componentVersion","purl","homepage",
      "sources","modifiedSources","modifications","modificationsText","copyrights"
    ];
    rows.push(header.map(csvEscape).join(","));
    d.licenses.forEach((lic) => {
      const base = [
        lic.licenseId ?? "",
        lic.name ?? "",
        lic.text ? "yes" : "no"
      ];
      const comps = lic.components ?? [];
      if (comps.length === 0) {
        rows.push([...base, "", "", "", "", "", "", "", "", ""].map(csvEscape).join(","));
      } else {
        comps.forEach((c) => {
          rows.push([
            ...base,
            c.name ?? "",
            c.version ?? "",
            c.purl ?? "",
            c.homepage ?? "",
            (c.sources ?? []).join(" | "),
            (c.modifiedSources ?? []).join(" | "),
            (c.modifications ?? []).join(" | "),
            c.modificationsText ?? "",
            (c.copyrights ?? []).join(" | ")
          ].map(csvEscape).join(","));
        });
      }
    });
    return rows.join("\n");
  };

  const toMarkdown = (d: NoticeDoc) => {
    const isStr = (x: unknown): x is string => typeof x === "string" && x.length > 0;

    const lines: string[] = [];
    const title = d.name ?? d.sourceFileName ?? "NOTICE";
    lines.push(`# ${title}`);
    if (d.writtenOffer) {
      lines.push("", `> ${d.writtenOffer}`);
    }
    lines.push("");

    d.licenses.forEach((lic, i) => {
      lines.push(`## ${lic.licenseId ?? "UNKNOWN"}${lic.name ? ` — ${lic.name}` : ""}`);
      if (lic.text) {
        lines.push("", "### License Text", "", "```", lic.text, "```");
      }

      lines.push("", "### Components");
      (lic.components ?? []).forEach((c) => {
        const block = [
          `- **${c.name ?? "(unnamed)"}${c.version ? ` @ ${c.version}` : ""}**`,
          c.purl ? `  - PURL: \`${c.purl}\`` : null,
          c.homepage ? `  - Homepage: ${c.homepage}` : null,
          (c.sources && c.sources.length) ? `  - Sources: ${c.sources.join(", ")}` : null,
          (c.modifiedSources && c.modifiedSources.length) ? `  - Modified Sources: ${c.modifiedSources.join(", ")}` : null,
          (c.modifications && c.modifications.length) ? `  - Modifications: ${c.modifications.join("; ")}` : null,
          c.modificationsText ? `  - Modifications Text: ${c.modificationsText}` : null,
          (c.copyrights && c.copyrights.length) ? `  - Copyrights: ${c.copyrights.join(" | ")}` : null
        ].filter(isStr);

        lines.push(...block);
      });

      if (i < d.licenses.length - 1) lines.push("");
    });

    return lines.join("\n");
  };


  const exportJSON = () => {
    if (!doc) return;
    const name = (doc.name ?? `notice-${id}`) + ".json";
    downloadBlob(JSON.stringify(doc, null, 2), name, "application/json");
  };
  const exportCSV = () => {
    if (!doc) return;
    const name = (doc.name ?? `notice-${id}`) + ".csv";
    downloadBlob(toCSV(doc), name, "text/csv");
  };
  const exportMD = () => {
    if (!doc) return;
    const name = (doc.name ?? `notice-${id}`) + ".md";
    downloadBlob(toMarkdown(doc), name, "text/markdown");
  };

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-40 rounded bg-muted animate-pulse" />
            <div className="mt-2 h-4 w-56 rounded bg-muted/70 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-36 rounded bg-muted animate-pulse" />
            <div className="h-9 w-40 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-[420px] rounded-xl border bg-muted/30 p-4">
          <div className="h-full w-full rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (state === "missing" || !doc) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 rounded-xl border p-6">
        <div className="text-base font-semibold">
          {t("components.noticeViewer.missing.title")}
        </div>
        <p className="text-sm text-muted-foreground">
          {t("components.noticeViewer.missing.descBeforeId")} <code>{id}</code> {t("components.noticeViewer.missing.descAfterId")}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/")}>
            {t("components.noticeViewer.missing.goHome")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">
            {doc.name ?? doc.sourceFileName ?? t("components.noticeViewer.header.titleFallback")}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("components.noticeViewer.header.subtitle", { percent: doc.completedPercent })}
            {doc.sourceFileName ? t("components.noticeViewer.header.sourceSuffix", { fileName: doc.sourceFileName }) : ""}
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label={t("actions.export.menuAria")}>
                <FileDown className="mr-2 size-4" />
                {t("actions.export.label")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("actions.export.label")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportJSON}>
                <FileText className="mr-2 size-4" />
                {t("actions.export.json")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportCSV}>
                <Table className="mr-2 size-4" />
                {t("actions.export.csv")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportMD}>
                <FileText className="mr-2 size-4" />
                {t("actions.export.markdown")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={handleCopy}
            className={`inline-flex h-9 ${copied ? "success-glow" : ""} cursor-pointer items-center gap-2 rounded-md border bg-background px-4 text-foreground transition hover:bg-accent hover:text-accent-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`}
            aria-live="polite"
            aria-label={t("components.noticeViewer.buttons.copy.aria")}
          >
            <div className="relative inline-flex w-4 justify-center">
              <AnimatePresence initial={false} mode="popLayout">
                {copied ? (
                  <motion.span
                    key="cp-done"
                    initial={{ scale: 0.6, opacity: 0, y: -4 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.6, opacity: 0, y: 4 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                    className="inline-flex text-emerald-600"
                  >
                    <Check className="size-4" aria-hidden />
                  </motion.span>
                ) : (
                  <motion.span
                    key="cp-idle"
                    initial={false}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    className="inline-flex"
                  >
                    <Copy className="size-4" aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="text-sm">
              {copied ? t("components.noticeViewer.buttons.copy.done") : t("components.noticeViewer.buttons.copy.idle")}
            </span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 p-0">
        <pre className="overflow-x-auto whitespace-pre-wrap p-4 text-xs">
{jsonPretty}
        </pre>
      </div>
    </div>
  );
}
