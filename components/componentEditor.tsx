"use client";

import ArrayField from "@/components/arrayField";
import type { NoticeComponent } from "@/types/notice";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  value: NoticeComponent;
  onChange: (v: NoticeComponent) => void;
  onRemove?: () => void;
  index?: number;
};

export default function ComponentEditor({ value, onChange, onRemove, index }: Props) {
  const { t } = useTranslation("common");

  const set = <K extends keyof NoticeComponent>(k: K, v: NoticeComponent[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          {typeof index === "number"
            ? t("components.componentEditor.componentWithIndex", { index: index + 1 })
            : t("components.componentEditor.component")}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            {t("components.componentEditor.remove")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <div className="text-xs font-medium">{t("components.componentEditor.fields.name")}</div>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={value.name || ""}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("components.componentEditor.placeholders.name")}
          />
        </label>
        <label className="space-y-1">
          <div className="text-xs font-medium">{t("components.componentEditor.fields.version")}</div>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={value.version || ""}
            onChange={(e) => set("version", e.target.value)}
            placeholder={t("components.componentEditor.placeholders.version")}
          />
        </label>
        <label className="space-y-1">
          <div className="text-xs font-medium">{t("components.componentEditor.fields.purl")}</div>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={value.purl || ""}
            onChange={(e) => set("purl", e.target.value)}
            placeholder={t("components.componentEditor.placeholders.purl")}
          />
        </label>
        <label className="space-y-1">
          <div className="text-xs font-medium">{t("components.componentEditor.fields.homepage")}</div>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={value.homepage || ""}
            onChange={(e) => set("homepage", e.target.value)}
            placeholder={t("components.componentEditor.placeholders.homepage")}
          />
        </label>
      </div>

      <ArrayField
        label={t("components.componentEditor.fields.copyrights")}
        values={value.copyrights}
        onChange={(v) => set("copyrights", v)}
        placeholder={t("components.componentEditor.placeholders.copyright")}
      />
      <ArrayField
        label={t("components.componentEditor.fields.sources")}
        values={value.sources}
        onChange={(v) => set("sources", v)}
        placeholder={t("components.componentEditor.placeholders.source")}
      />
      <ArrayField
        label={t("components.componentEditor.fields.modifiedSources")}
        values={value.modifiedSources}
        onChange={(v) => set("modifiedSources", v)}
        placeholder={t("components.componentEditor.placeholders.modifiedSource")}
      />
      <ArrayField
        label={t("components.componentEditor.fields.modifications")}
        values={value.modifications}
        onChange={(v) => set("modifications", v)}
        placeholder={t("components.componentEditor.placeholders.modification")}
      />

      <label className="space-y-1">
        <div className="text-xs font-medium">{t("components.componentEditor.fields.modificationsText")}</div>
        <textarea
          className="w-full rounded-md border px-3 py-2 text-sm min-h-24"
          value={value.modificationsText || ""}
          onChange={(e) => set("modificationsText", e.target.value)}
          placeholder={t("components.componentEditor.placeholders.modificationsText")}
        />
      </label>
    </div>
  );
}
