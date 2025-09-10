export type NoticeComponent = {
  name: string;
  version?: string;
  purl?: string;
  homepage?: string;

  copyrights?: string[];
  sources?: string[];
  modifiedSources?: string[];
  modifications?: string[];
  modificationsText?: string;
  completed?: boolean;
};

export type LicenseBlock = {
  licenseId: string;
  name?: string;
  text?: string;
  copyrights?: string[];
  components: NoticeComponent[];
  completed?: boolean;
};

export type NoticeDoc = {
  name?: string;
  sourceFileName?: string;
  createdAt?: string;
  version: string;
  writtenOffer?: string | null;
  completedPercent: number;
  licenses: LicenseBlock[];
};
