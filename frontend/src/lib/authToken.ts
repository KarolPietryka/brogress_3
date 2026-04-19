const STORAGE_KEY = "brogress.jwt";

/** JWT from localStorage (set after login). Optional dev fallback: `VITE_DEV_JWT`. */
export function getAuthToken(): string | null {
  const fromStorage = localStorage.getItem(STORAGE_KEY)?.trim();
  if (fromStorage) return fromStorage;
  const fromEnv = import.meta.env.VITE_DEV_JWT?.trim();
  return fromEnv || null;
}

export function setAuthToken(token: string | null): void {
  if (!token) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, token);
}
