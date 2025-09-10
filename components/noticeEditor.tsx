"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loadNotice, saveNotice } from "@/utils/storage";
import type { NoticeDoc } from "@/types/notice";
import LicenseEditor from "@/components/licenseEditor";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Save, ChevronDown, ChevronRight, FileDown, FileText, Table } from "lucide-react";
import { computeProgress, isLicenseComplete, isComponentComplete } from "@/utils/noticeProgress";
import ComponentEditor from "@/components/componentEditor";
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

export default function NoticeEditor({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [doc, setDoc] = useState<NoticeDoc | null>(null);
  const [savedTick, setSavedTick] = useState(0);
  const saveT = useRef<number | null>(null);

  const [openLicenses, setOpenLicenses] = useState<Record<string, boolean>>({});
  const [openComponents, setOpenComponents] = useState<Record<string, boolean>>({});

  const { t } = useTranslation("common");

  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      const loaded = loadNotice(id);
      if (!alive) return;
      setDoc(loaded);
      setState(loaded ? "ready" : "missing");
    });
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    return () => {
      if (saveT.current) window.clearTimeout(saveT.current);
    };
  }, []);

  const progress = useMemo(() => (doc ? computeProgress(doc) : null), [doc]);
  const jsonPretty = useMemo(() => (doc ? JSON.stringify(doc, null, 2) : ""), [doc]);

  const setDocField: <K extends keyof NoticeDoc>(k: K, v: NoticeDoc[K]) => void =
    useCallback(
      (k: keyof NoticeDoc, v: NoticeDoc[keyof NoticeDoc]) => {
        setDoc((d) => (d ? { ...d, [k]: v } : d));
      },
      []
    );

  const updateLicense = (i: number, v: NoticeDoc["licenses"][number]) => {
    if (!doc) return;
    const next = [...doc.licenses];
    next[i] = v;
    setDoc({ ...doc, licenses: next });
  };

  const removeLicense = (i: number) => {
    if (!doc) return;
    setDoc({ ...doc, licenses: doc.licenses.filter((_, idx) => idx !== i) });
  };

  const addLicense = () => {
    if (!doc) return;
    const idx = doc.licenses.length;
    const idAnchor = `lic-${idx}`;
    setDoc({ ...doc, licenses: [...doc.licenses, { licenseId: "UNKNOWN", components: [] }] });
    setOpenLicenses((s) => ({ ...s, [idAnchor]: true }));
  };

  const handleSave = () => {
    if (!doc) return;
    const prepared: NoticeDoc = {
      ...doc,
      completedPercent: computeProgress(doc).percent,
    };
    saveNotice(id, prepared);
    setDoc(prepared);
    setSavedTick((x) => x + 1);
    saveT.current = window.setTimeout(() => setSavedTick((x) => x), 900);
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
    const payload = JSON.stringify({ ...doc, completedPercent: computeProgress(doc).percent }, null, 2);
    downloadBlob(payload, name, "application/json");
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

  const collapseAll = () => { setOpenLicenses({}); setOpenComponents({}); };
  const expandAll = () => {
    if (!doc) return;
    const lmap: Record<string, boolean> = {};
    const cmap: Record<string, boolean> = {};
    doc.licenses.forEach((l, li) => {
      lmap[`lic-${li}`] = true;
      (l.components ?? []).forEach((_, ci) => { cmap[`lic-${li}-cmp-${ci}`] = true; });
    });
    setOpenLicenses(lmap); setOpenComponents(cmap);
  };

  const scrollTo = (anchor: string) => {
    document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  if (state === "missing" || !doc || !progress) {
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
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">
            {doc.name ?? doc.sourceFileName ?? t("components.noticeEditor.header.titleFallback")}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("components.noticeViewer.header.subtitle", { percent: progress.percent })}
            {doc.sourceFileName ? t("components.noticeViewer.header.sourceSuffix", { fileName: doc.sourceFileName }) : ""}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label={t("components.noticeEditor.buttons.save.aria")}
          >
            <div className="relative inline-flex w-4 justify-center">
              <AnimatePresence initial={false} mode="popLayout">
                {savedTick > 0 ? (
                  <motion.span
                    key={`save-done-${savedTick}`}
                    initial={{ scale: 0.6, opacity: 0, y: -4 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.6, opacity: 0, y: 4 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                    className="inline-flex"
                  >
                    <Check className="size-4" aria-hidden />
                  </motion.span>
                ) : (
                  <motion.span key="save-idle" initial={false} className="inline-flex">
                    <Save className="size-4" aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="text-sm">
              {savedTick > 0
                ? t("components.noticeEditor.buttons.save.done")
                : t("components.noticeEditor.buttons.save.idle")}
            </span>
          </button>

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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={collapseAll}>
              {t("components.noticeEditor.controls.collapseAll")}
            </Button>
            <Button variant="secondary" size="sm" onClick={expandAll}>
              {t("components.noticeEditor.controls.openAll")}
            </Button>
          </div>

          <div className="rounded-xl border p-4 space-y-3" id="doc-meta">
            <div className="text-sm font-semibold">
              {t("components.noticeEditor.doc.sectionTitle")}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <div className="text-xs font-medium">
                  {t("components.noticeEditor.doc.fields.name")}
                </div>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={doc.name ?? ""}
                  onChange={(e) => setDocField("name", e.target.value)}
                  placeholder={t("components.noticeEditor.doc.placeholders.name")}
                />
              </label>
              <label className="space-y-1">
                <div className="text-xs font-medium">
                  {t("components.noticeEditor.doc.fields.versionSchema")}
                </div>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={doc.version}
                  onChange={(e) => setDocField("version", e.target.value)}
                  placeholder={t("components.noticeEditor.doc.placeholders.version")}
                />
              </label>
            </div>
            <label className="space-y-1">
              <div className="text-xs font-medium">
                {t("components.noticeEditor.doc.fields.writtenOffer")}
              </div>
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm min-h-24"
                value={doc.writtenOffer ?? ""}
                onChange={(e) => setDocField("writtenOffer", e.target.value)}
                placeholder={t("components.noticeEditor.doc.placeholders.writtenOffer")}
              />
            </label>

            <div className="text-xs text-muted-foreground">
              {t("components.noticeEditor.doc.completedDerivedLabel")}{" "}
              <span className="font-medium">{progress.percent}%</span>
            </div>
          </div>

          <div className="space-y-3" id="licenses-root">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                {t("components.noticeEditor.licenses.title")}
              </div>
              <Button type="button" variant="secondary" onClick={addLicense}>
                {t("components.noticeEditor.licenses.add")}
              </Button>
            </div>

            {(doc.licenses ?? []).map((lic, li) => {
              const licAnchor = `lic-${li}`;
              const open = !!openLicenses[licAnchor];
              const licComplete = isLicenseComplete(lic);
              return (
                <div key={li} id={licAnchor} className="rounded-xl border">
                  <button
                    type="button"
                    onClick={() => setOpenLicenses((s) => ({ ...s, [licAnchor]: !open }))}
                    className="flex w-full items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      <div className="text-sm font-semibold">
                        {lic.licenseId || "UNKNOWN"}{lic.name ? ` — ${lic.name}` : ""}
                      </div>
                    </div>
                    <span
                      className={
                        licComplete
                          ? "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 text-xs"
                          : "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs"
                      }
                    >
                      {licComplete ? <Check className="size-4" /> : null}
                      {licComplete
                        ? t("components.noticeEditor.licenses.status.complete")
                        : t("components.noticeEditor.licenses.status.incomplete")}
                    </span>
                  </button>

                  {open && (
                    <div className="space-y-4 p-4 border-t">
                      <div className="rounded-lg border p-3">
                        <div className="mb-2 text-xs font-medium uppercase tracking-wide">
                          {t("components.noticeEditor.licenses.paramsTitle")}
                        </div>
                        <LicenseEditor
                          value={lic}
                          index={li}
                          onChange={(v) => updateLicense(li, v)}
                          onRemove={() => removeLicense(li)}
                        />
                      </div>

                      <div className="space-y-2">
                        {(lic.components ?? []).map((c, ci) => {
                          const cmpAnchor = `lic-${li}-cmp-${ci}`;
                          const cOpen = !!openComponents[cmpAnchor];
                          const cDone = isComponentComplete(c);
                          return (
                            <div key={ci} id={cmpAnchor} className="rounded-lg border">
                              <button
                                type="button"
                                onClick={() => setOpenComponents((s) => ({ ...s, [cmpAnchor]: !cOpen }))}
                                className="flex w-full items-center justify-between px-3 py-2"
                              >
                                <div className="flex items-center gap-2">
                                  {cOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                  <div className="text-sm">
                                    {t("components.noticeEditor.components.label")}{" "}
                                    <span className="font-medium">{c.name || t("components.noticeEditor.components.unnamed")}</span>
                                    {c.version ? ` @ ${c.version}` : ""}
                                  </div>
                                </div>
                                <span
                                  className={
                                    cDone
                                      ? "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 text-xs"
                                      : "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs"
                                  }
                                >
                                  {cDone ? <Check className="size-4" /> : null}
                                  {cDone
                                    ? t("components.noticeEditor.licenses.status.complete")
                                    : t("components.noticeEditor.licenses.status.incomplete")}
                                </span>
                              </button>

                              {cOpen && (
                                <div className="border-t p-3">
                                  <ComponentEditor
                                    value={c}
                                    index={ci}
                                    onChange={(next) => {
                                      setDoc((d) => {
                                        if (!d) return d;
                                        const L = [...d.licenses];
                                        const comps = [...(L[li].components ?? [])];
                                        comps[ci] = next;
                                        L[li] = { ...L[li], components: comps };
                                        return { ...d, licenses: L };
                                      });
                                    }}
                                    onRemove={() => {
                                      setDoc((d) => {
                                        if (!d) return d;
                                        const L = [...d.licenses];
                                        const comps = (L[li].components ?? []).filter((_, x) => x !== ci);
                                        L[li] = { ...L[li], components: comps };
                                        return { ...d, licenses: L };
                                      });
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <details className="rounded-xl border p-4">
            <summary className="cursor-pointer text-sm font-medium">
              {t("components.noticeEditor.debug.title")}
            </summary>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs">{jsonPretty}</pre>
          </details>
        </div>

        <aside className="md:sticky md:top-6 space-y-4 h-fit">
          <div className="rounded-xl border p-4">
            <div className="mb-2 text-sm font-medium">
              {t("components.noticeEditor.aside.progressTitle")}
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-muted">
              <div
                className="h-2 bg-foreground transition-[width]"
                style={{ width: `${progress.percent}%` }}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress.percent}
                role="progressbar"
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {progress.completeComponents}/{progress.totalComponents} {t("components.noticeEditor.aside.componentsComplete")} ·{" "}
              {progress.completeLicenses}/{progress.licensesCount} {t("components.noticeEditor.aside.licensesComplete")}
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-2 text-sm font-medium">
              {t("components.noticeEditor.aside.navigate")}
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => scrollTo("doc-meta")} className="hover:underline">
                  {t("components.noticeEditor.aside.docMeta")}
                </button>
              </li>
              <li className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("components.noticeEditor.aside.licenses")}
                </div>
                <ul className="space-y-1">
                  {doc.licenses.map((l, li) => {
                    const licAnchor = `lic-${li}`;
                    const complete = isLicenseComplete(l);
                    return (
                      <li key={li}>
                        <button onClick={() => scrollTo(licAnchor)} className="hover:underline">
                          {l.licenseId || "UNKNOWN"}{l.name ? ` — ${l.name}` : " "}{" "}
                          {complete ? <span className="text-emerald-600">✓</span> : <span className="text-muted-foreground">•</span>}
                        </button>
                        <ul className="ml-4 space-y-0.5">
                          {(l.components ?? []).map((c, ci) => {
                            const cmpAnchor = `lic-${li}-cmp-${ci}`;
                            const cDone = isComponentComplete(c);
                            return (
                              <li key={ci}>
                                <button onClick={() => scrollTo(cmpAnchor)} className="hover:underline">
                                  {c.name || t("components.noticeEditor.components.unnamed")}{c.version ? ` @ ${c.version}` : ""}{" "}
                                  {cDone ? <span className="text-emerald-600">✓</span> : <span className="text-muted-foreground">•</span>}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
