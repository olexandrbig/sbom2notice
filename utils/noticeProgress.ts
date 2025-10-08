import type { NoticeDoc, LicenseBlock, NoticeComponent } from "@/types/notice";

export function isComponentComplete(c: NoticeComponent): boolean {
  return !!c?.name && (!!c?.version || !!c?.purl);
}
export function isLicenseComplete(l: LicenseBlock): boolean {
  const licOk = !!l?.licenseId && !!l?.name && !!l?.text;
  const compsOk = (l?.components ?? []).every(isComponentComplete);
  return licOk && compsOk;
}

export function computeProgress(doc: NoticeDoc) {
  const licenses = doc.licenses ?? [];
  const totalComponents = licenses.reduce((n, l) => n + (l.components?.length ?? 0), 0);
  const completeLicenses = licenses.filter(isLicenseComplete).length;
  const completeComponents = licenses.reduce(
    (n, l) => n + (l.components ?? []).filter(isComponentComplete).length,
    0
  );

  const ratio = totalComponents === 0 ? 0 : Math.round((completeComponents / totalComponents) * 100);
  const allComplete = completeLicenses === licenses.length && completeComponents === totalComponents && licenses.length > 0;

  return {
    totalComponents,
    completeComponents,
    licensesCount: licenses.length,
    completeLicenses,
    percent: allComplete ? 100 : ratio,
    allComplete,
  };
}
