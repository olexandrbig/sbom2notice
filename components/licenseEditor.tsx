"use client";

import ArrayField from "@/components/arrayField";
import type { LicenseBlock } from "@/types/notice";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  value: LicenseBlock;
  onChange: (v: LicenseBlock) => void;
  onRemove?: () => void;
  index?: number;
};

export default function LicenseEditor({ value, onChange, onRemove }: Props) {
  const { t } = useTranslation("common");
  const set = <K extends keyof LicenseBlock>(k: K, v: LicenseBlock[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <div className="text-xs font-medium">{t("components.licenseEditor.fields.licenseId")}</div>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={value.licenseId || ""}
            onChange={(e) => set("licenseId", e.target.value)}
            placeholder={t("components.licenseEditor.placeholders.licenseId")}
          />
        </label>
        <label className="space-y-1">
          <div className="text-xs font-medium">{t("components.licenseEditor.fields.name")}</div>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={value.name || ""}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("components.licenseEditor.placeholders.name")}
          />
        </label>
      </div>

      <label className="space-y-1">
        <div className="text-xs font-medium">{t("components.licenseEditor.fields.text")}</div>
        <textarea
          className="w-full rounded-md border px-3 py-2 text-sm min-h-28"
          value={value.text || ""}
          onChange={(e) => set("text", e.target.value)}
          placeholder={t("components.licenseEditor.placeholders.text")}
        />
      </label>

      <ArrayField
        label={t("components.licenseEditor.labels.copyrights")}
        values={value.copyrights}
        onChange={(v) => set("copyrights", v)}
        placeholder={t("components.licenseEditor.placeholders.copyright")}
      />

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
          {t("components.licenseEditor.buttons.remove")}
        </button>
      )}
    </div>
  );
}
