/** In dev, Vite proxies `/api` → backend. In prod, set `VITE_API_URL`. */
function apiOrigin(): string {
  if (import.meta.env.DEV) return "";
  return import.meta.env.VITE_API_URL ?? "";
}

export type AuthPayload = { token: string; nick: string };

export async function loginRequest(nick: string, password: string): Promise<AuthPayload> {
  const base = apiOrigin();
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ nick, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<AuthPayload>;
}
