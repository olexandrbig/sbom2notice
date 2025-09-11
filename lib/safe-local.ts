export function safeGet(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
  }
}

let t: number | null = null;
export function safeSetDebounced(key: string, value: string, ms = 500) {
  if (t) window.clearTimeout(t);
  t = window.setTimeout(() => safeSet(key, value), ms);
}

export function safeRemove(key: string): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch {}
}
