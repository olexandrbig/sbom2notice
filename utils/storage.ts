import type { NoticeDoc } from "@/types/notice";

const PREFIX = "notice:";
const INDEX_KEY = "notice:index";

export function saveNotice(id: string, doc: NoticeDoc) {
  localStorage.setItem(PREFIX + id, JSON.stringify(doc));
  const idx = loadIndex();
  if (!idx.includes(id)) {
    idx.push(id);
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  }
}

export function loadNotice(id: string): NoticeDoc | null {
  const raw = localStorage.getItem(PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NoticeDoc;
  } catch {
    return null;
  }
}

export function loadIndex(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function removeNotice(id: string) {
  localStorage.removeItem(PREFIX + id);
  const idx = loadIndex().filter((x) => x !== id);
  localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
}

export function loadAllNotices(): Array<{ id: string; doc: NoticeDoc }> {
  const ids = loadIndex();
  const res: Array<{ id: string; doc: NoticeDoc }> = [];
  for (const id of ids) {
    const doc = loadNotice(id);
    if (doc) res.push({ id, doc });
  }
  return res;
}
