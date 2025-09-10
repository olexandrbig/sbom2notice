"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { validateSbom } from "@/utils/sbomValidators";
import { UploadCloud } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  maxSizeBytes?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValid?(payload: { kind: "cyclonedx" | "spdx"; data: any; file: File }): void;
  compact?: boolean;
};

export default function UploadSbom({ maxSizeBytes = 5 * 1024 * 1024, onValid, compact = false }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { t } = useTranslation("common");

  const parseFile = useCallback(async (file: File) => {
    setError(null);
    try {
      if (file.size > maxSizeBytes) {
        const maxMB = Math.round(maxSizeBytes / (1024 * 1024));
        setError(t("components.uploadSbom.errors.tooLarge", { maxMB }));
        console.error("[SBOM] oversize file", { name: file.name, size: file.size });
        return;
      }
      const text = await file.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        setError(t("components.uploadSbom.errors.invalidJson"));
        console.error("[SBOM] JSON parse error", { name: file.name });
        return;
      }
      const result = validateSbom(json);
      if (!result.ok) {
        setError(result.error);
        console.error("[SBOM] schema validation failed", { name: file.name, error: result.error });
        return;
      }
      onValid?.({ kind: result.kind, data: result.data, file });
    } catch (e) {
      setError(t("components.uploadSbom.errors.unexpected"));
      console.error("[SBOM] unexpected error", e);
    }
  }, [onValid, maxSizeBytes, t]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles?.length) return;
    await parseFile(acceptedFiles[0]);
  }, [parseFile]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      "application/json": [".json", ".cdx.json", ".spdx.json"],
      "text/json": [".json"],
      "application/octet-stream": [".sbom"]
    },
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: (rej) => {
      setDragActive(false);
      const first = rej?.[0];
      if (first?.errors?.[0]?.code === "file-invalid-type") {
        setError(t("components.uploadSbom.errors.invalidType"));
      } else {
        setError(t("components.uploadSbom.errors.rejectGeneric"));
      }
      console.error("[SBOM] drop rejected", rej);
    }
  });

  const shellClasses = compact
    ? "rounded-md border p-3"
    : "rounded-xl border p-6";
  const titleClasses = compact ? "text-sm font-medium" : "font-medium";
  const subtitleClasses = compact ? "text-xs text-muted-foreground" : "text-xs text-muted-foreground";
  const buttonSize = compact ? "sm" : "default";

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={[
          shellClasses,
          "transition",
          dragActive ? "border-ring ring-[3px] ring-ring/40" : "border-border"
        ].join(" ")}
        aria-label={t("components.uploadSbom.dropAria")}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UploadCloud className={compact ? "size-4" : "size-5"} aria-hidden />
            <div className="text-sm">
              <div className={titleClasses}>{t("components.uploadSbom.title")}</div>
              {!compact && (
                <div className={subtitleClasses}>
                  {t("components.uploadSbom.subtitle")}
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <Button size={buttonSize} onClick={open} aria-label={t("components.uploadSbom.chooseAria")}>
              {t("components.uploadSbom.button")}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div role="status" aria-live="polite" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
