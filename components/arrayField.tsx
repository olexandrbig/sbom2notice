"use client";

import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type Props = {
  label: string;
  values?: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

export default function ArrayField({ label, values = [], onChange, placeholder }: Props) {
  const { t } = useTranslation("common");

  const updateAt = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    onChange(next);
  };
  const removeAt = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...(values || []), ""]);

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium">{label}</div>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={v}
              onChange={(e) => updateAt(i, e.target.value)}
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="inline-flex items-center justify-center rounded-md border px-2 py-2 text-destructive hover:bg-destructive/10"
              aria-label={t("components.arrayField.removeItem")}
              title={t("components.arrayField.remove")}
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          <Plus className="mr-1 size-4" /> {t("components.arrayField.addItem")}
        </Button>
      </div>
    </div>
  );
}
