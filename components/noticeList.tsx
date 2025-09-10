"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadAllNotices, removeNotice, saveNotice } from "@/utils/storage";
import type { NoticeDoc } from "@/types/notice";
import { Trash2, ExternalLink, FileDown, FileText, Table } from "lucide-react";
import UploadSbom from "@/components/uploadSbom";
import { sbomToNotice } from "@/utils/sbomToNotice";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function NoticeList() {
  const router = useRouter();
  const [rows, setRows] = useState<Array<{ id: string; doc: NoticeDoc }> | null>(null);
  const { t } = useTranslation("common");

  useEffect(() => {
    const list = loadAllNotices();
    list.sort((a, b) => (b.doc.createdAt ?? "").localeCompare(a.doc.createdAt ?? ""));
    setRows(list);
  }, []);

  const refresh = () => {
    const list = loadAllNotices();
    list.sort((a, b) => (b.doc.createdAt ?? "").localeCompare(a.doc.createdAt ?? ""));
    setRows(list);
  };

  const del = (id: string) => {
    if (!confirm(t("components.noticeList.confirmDelete"))) return;
    removeNotice(id);
    refresh();
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

  const toMarkdown = (d: NoticeDoc, id: string) => {
    const isStr = (x: unknown): x is string => typeof x === "string" && x.length > 0;

    const lines: string[] = [];
    const title = d.name ?? d.sourceFileName ?? `NOTICE ${id}`;
    lines.push(`# ${title}`, "");

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


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpload = ({ data, file }: { data: any; file: File }) => {
    try {
      const notice = sbomToNotice(data, "1.0.0");
      const base = file.name.replace(/\.(cdx\.json|spdx\.json|json|sbom)$/i, "");
      const enriched: NoticeDoc = {
        ...notice,
        name: base || file.name,
        sourceFileName: file.name,
        createdAt: new Date().toISOString(),
      };
      const id = globalThis.crypto?.randomUUID?.() ?? Date.now().toString();
      saveNotice(id, enriched);
      router.push(`/notice/${id}`);
    } catch (e) {
      console.error("Conversion failed", e);
      alert(t("components.noticeList.alerts.convertFailed"));
    }
  };

  const header = (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h1 className="text-lg font-semibold">{t("components.noticeList.header.title")}</h1>
      <div className="w-full max-w-md">
        <UploadSbom compact onValid={handleUpload} />
      </div>
    </div>
  );

  if (rows === null) {
    return (
      <div className="mx-auto max-w-5xl">
        {header}
        <div className="rounded-xl border">
          <div className="h-12 border-b bg-muted/30 animate-pulse" />
          <div className="h-12 border-b bg-muted/10 animate-pulse" />
          <div className="h-12 bg-muted/10 animate-pulse" />
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-5xl">
        {header}
        <div className="rounded-xl border p-6">
          <div className="text-base font-semibold">{t("components.noticeList.empty.title")}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("components.noticeList.empty.hint")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {header}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
          <tr className="text-left">
            <th className="px-4 py-3">{t("components.noticeList.table.name")}</th>
            <th className="px-4 py-3">{t("components.noticeList.table.id")}</th>
            <th className="px-4 py-3">{t("components.noticeList.table.completed")}</th>
            <th className="px-4 py-3">{t("components.noticeList.table.licenses")}</th>
            <th className="px-4 py-3 text-right">{t("components.noticeList.table.actions")}</th>
          </tr>
          </thead>
          <tbody>
          {rows.map(({ id, doc }) => (
            <tr key={id} className="border-t">
              <td className="px-4 py-3">{doc.name ?? doc.sourceFileName ?? t("components.noticeList.row.untitled")}</td>
              <td className="px-4 py-3"><code className="text-xs">{id}</code></td>
              <td className="px-4 py-3">
                {t("components.noticeList.row.completedCell", {
                  percent: doc.completedPercent,
                  count: doc.licenses.reduce((n, l) => n + l.components.length, 0),
                })}
              </td>
              <td className="px-4 py-3">{doc.licenses.length}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link href={`/notice/${id}`} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-accent hover:text-accent-foreground">
                    <ExternalLink className="size-4" />
                    {t("components.noticeList.buttons.open")}
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-accent hover:text-accent-foreground"
                        aria-label={t("actions.export.menuAria")}
                      >
                        <FileDown className="size-4" />
                        {t("actions.export.label")}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("actions.export.label")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => downloadBlob(JSON.stringify(doc, null, 2), `${doc.name ?? `notice-${id}`}.json`, "application/json")}>
                        <FileText className="mr-2 size-4" />
                        {t("actions.export.json")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadBlob(toCSV(doc), `${doc.name ?? `notice-${id}`}.csv`, "text/csv")}>
                        <Table className="mr-2 size-4" />
                        {t("actions.export.csv")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadBlob(toMarkdown(doc, id), `${doc.name ?? `notice-${id}`}.md`, "text/markdown")}>
                        <FileText className="mr-2 size-4" />
                        {t("actions.export.markdown")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button onClick={() => del(id)} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-destructive hover:bg-destructive/10">
                    <Trash2 className="size-4" />
                    {t("components.noticeList.buttons.delete")}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
