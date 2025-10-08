import type { NoticeDoc, LicenseBlock, NoticeComponent } from "@/types/notice";

type KnownSpdx = { name?: string; licenseText?: string };
let SPDX_FULL: Record<string, KnownSpdx> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SPDX_FULL = require("spdx-license-list/full");
} catch {
  SPDX_FULL = {};
}

const norm = (s?: string | null) => (typeof s === "string" ? s.trim() : "");
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr.filter(Boolean))) as T[];
const asArray = <T,>(x: T | T[] | undefined | null): T[] =>
  Array.isArray(x) ? x : x ? [x as T] : [];

function pickPurlFromExternalRefs(refs?: any[]): string | undefined {
  if (!Array.isArray(refs)) return undefined;
  const purlRef = refs.find((r) => r?.referenceType?.toLowerCase() === "purl" || r?.referenceCategory === "PACKAGE-MANAGER");
  return purlRef?.referenceLocator || purlRef?.url;
}

function sourcesFromExternalRefs(refs?: any[]): string[] {
  if (!Array.isArray(refs)) return [];
  // SPDX: { referenceType, referenceLocator, url }
  // CDX:  { type, url, comment }
  const urls = refs
    .map((r) => r?.url || r?.referenceLocator)
    .filter((u) => typeof u === "string" && u.startsWith("http"));
  return uniq(urls);
}

function sourcesFromCdxExternalRefs(refs?: any[]): string[] {
  if (!Array.isArray(refs)) return [];
  const urls = refs
    .map((r) => r?.url)
    .filter((u) => typeof u === "string" && u.startsWith("http"));
  return uniq(urls);
}

function getLicenseIdFromSpdx(pkg: any): string | undefined {
  const lc = norm(pkg?.licenseConcluded);
  if (lc && lc !== "NOASSERTION" && lc !== "NONE") return lc;
  const ld = norm(pkg?.licenseDeclared);
  if (ld && ld !== "NOASSERTION" && ld !== "NONE") return ld;
  const lif = asArray<string>(pkg?.licenseInfoFromFiles).map(norm).find(Boolean);
  if (lif && lif !== "NOASSERTION" && lif !== "NONE") return lif;
  return undefined;
}

function getCopyrightsFromSpdx(pkg: any): string[] {
  const root = norm(pkg?.copyrightText);
  const fileLevel = asArray<any>(pkg?.hasFiles)
    .map((f) => norm(f?.copyrightText))
    .filter(Boolean);
  return uniq([root, ...fileLevel]);
}

function getHomepageFromSpdx(pkg: any): string | undefined {
  const dl = norm(pkg?.downloadLocation);
  const hp = norm(pkg?.homepage);
  const refs = sourcesFromExternalRefs(pkg?.externalRefs);
  return hp || dl || refs[0];
}

function getPurlFromSpdx(pkg: any): string | undefined {
  return pickPurlFromExternalRefs(pkg?.externalRefs);
}

function getLicenseBlocksFromCycloneDxComponentLicenses(licenses: any[]): { id?: string; name?: string; text?: string }[] {
  const out: { id?: string; name?: string; text?: string }[] = [];
  (licenses || []).forEach((entry: any) => {
    const l = entry?.license;
    if (l) {
      const hit = SPDX_FULL[norm(l.id)];
      out.push({
        id: norm(l.id),
        name: norm(l.name) ? norm(l.name) : hit && hit.name ? hit.name : undefined,
        text: l?.text?.content ? String(l.text.content) : hit && hit.licenseText ? hit.licenseText : undefined,
      });
    } else if (entry?.expression) {
      out.push({ name: norm(entry.expression) });
    }
  });
  return out;
}

export function convertSpdxToNotice(spdx: any, opts?: { schemaVersion?: string }): NoticeDoc {
  const version = opts?.schemaVersion || "1.0.0";
  const pkgs: any[] = asArray(spdx?.packages);
  const total = pkgs.length || 0;

  const byLicenseId = new Map<string, LicenseBlock>();
  const unknown: Array<Pick<NoticeComponent, "name" | "version" | "purl">> = [];

  pkgs.forEach((pkg) => {
    const name = norm(pkg?.name) || "(unnamed)";
    const versionInfo = norm(pkg?.versionInfo);
    const licenseId = getLicenseIdFromSpdx(pkg);
    const purl = getPurlFromSpdx(pkg);
    const homepage = getHomepageFromSpdx(pkg);
    const copyrights = getCopyrightsFromSpdx(pkg);
    const sources = uniq([homepage, ...sourcesFromExternalRefs(pkg?.externalRefs)])
      .filter((s): s is string => Boolean(s));

    const component: NoticeComponent = {
      name,
      version: versionInfo || undefined,
      purl: purl || undefined,
      homepage: homepage || undefined,
      copyrights: copyrights.length ? copyrights : undefined,
      sources: sources.length ? sources : undefined,
    };

    const licKey = (licenseId || "UNKNOWN").toUpperCase();
    if (!licenseId) unknown.push({ name, version: component.version, purl: component.purl });

    const hit = SPDX_FULL[licKey];
    const lb =
      byLicenseId.get(licKey) ||
      {
        licenseId: licKey,
        name: hit && hit.name ? hit.name : undefined,
        text: hit && hit.licenseText ? hit.licenseText : undefined,
        components: [],
      };

    lb.components.push(component);
    byLicenseId.set(licKey, lb);
  });

  const knownCount = total - unknown.length;
  const completedPercent = total === 0 ? 0 : Math.round((knownCount / total) * 100);

  return {
    version,
    writtenOffer: null,
    completedPercent,
    licenses: Array.from(byLicenseId.values()),
  };
}

export function convertCycloneDxToNotice(cdx: any, opts?: { schemaVersion?: string }): NoticeDoc {
  const version = opts?.schemaVersion || "1.0.0";
  const comps: any[] = asArray(cdx?.components);
  const total = comps.length || 0;

  const byLicenseId = new Map<string, LicenseBlock>();
  const unknown: Array<Pick<NoticeComponent, "name" | "version" | "purl">> = [];

  comps.forEach((c) => {
    const name = norm(c?.name) || "(unnamed)";
    const versionInfo = norm(c?.version);
    const purl = norm(c?.purl);
    const homepage = norm(c?.homepage);
    const extRefs = c?.externalReferences || [];
    const sources = uniq([homepage, ...sourcesFromCdxExternalRefs(extRefs)]);

    const licenseEntries = getLicenseBlocksFromCycloneDxComponentLicenses(c?.licenses || []);
    const licenseKeys = licenseEntries.length
      ? licenseEntries.map((le) => (norm(le.id) || norm(le.name) || "UNKNOWN").toUpperCase())
      : ["UNKNOWN"];

    const modifications: string[] = [];
    let modificationsText: string | undefined;
    if (c?.modified === true) modifications.push("modified:true");
    if (c?.pedigree?.patches) modifications.push("pedigree:patches");
    if (c?.pedigree?.commits) modifications.push("pedigree:commits");
    if (c?.pedigree?.notes) modificationsText = norm(c?.pedigree?.notes) || undefined;

    const component: NoticeComponent = {
      name,
      version: versionInfo || undefined,
      purl: purl || undefined,
      homepage: homepage || undefined,
      sources: sources.length ? sources : undefined,
      modifiedSources: undefined,
      modifications: modifications.length ? modifications : undefined,
      modificationsText,
    };

    if (licenseKeys.includes("UNKNOWN")) {
      unknown.push({ name, version: component.version, purl: component.purl });
    }

    licenseKeys.forEach((key, idx) => {
      const lb =
        byLicenseId.get(key) ||
        {
          licenseId: key,
          name: licenseEntries[idx]?.name || undefined,
          text: licenseEntries[idx]?.text || undefined,
          components: [],
        };
      if (!lb.name && licenseEntries[idx]?.name) lb.name = licenseEntries[idx]?.name;
      if (!lb.text && licenseEntries[idx]?.text) lb.text = licenseEntries[idx]?.text;

      lb.components.push(component);
      byLicenseId.set(key, lb);
    });
  });

  const knownCount = total - unknown.length;
  const completedPercent = total === 0 ? 0 : Math.round((knownCount / total) * 100);

  return {
    version,
    writtenOffer: null,
    completedPercent,
    licenses: Array.from(byLicenseId.values()),
  };
}

export type InputFormat = "cyclonedx" | "spdx";

export function detectFormat(obj: any): InputFormat | null {
  if (obj?.bomFormat === "CycloneDX") return "cyclonedx";
  if (typeof obj?.spdxVersion === "string") return "spdx";
  return null;
}

export function sbomToNotice(obj: any, schemaVersion = "1.0.0"): NoticeDoc {
  const fmt = detectFormat(obj);
  if (fmt === "spdx") return convertSpdxToNotice(obj, { schemaVersion });
  if (fmt === "cyclonedx") return convertCycloneDxToNotice(obj, { schemaVersion });
  throw new Error("Unsupported SBOM format. Expected CycloneDX or SPDX JSON.");
}
