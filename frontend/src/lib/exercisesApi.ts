import type { BodyPartId } from "../constants/bodyParts";

export type ExerciseDto = {
  id: number;
  name: string;
  bodyPart: string;
};

/** In dev, Vite proxies `/api` → backend. In prod, set `VITE_API_URL` (e.g. https://api.example.com). */
function apiOrigin(): string {
  if (import.meta.env.DEV) return "";
  return import.meta.env.VITE_API_URL ?? "";
}

export async function fetchExerciseById(
  id: number,
  token: string,
): Promise<ExerciseDto> {
  const base = apiOrigin();
  const url = `${base}/api/exercises/by-id/${encodeURIComponent(String(id))}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized");
  }
  if (res.status === 404) {
    throw new Error("Not found");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<ExerciseDto>;
}

export async function fetchExercisesForBodyPart(
  bodyPart: BodyPartId,
  token: string,
): Promise<ExerciseDto[]> {
  const base = apiOrigin();
  const url = `${base}/api/exercises/${encodeURIComponent(bodyPart)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<ExerciseDto[]>;
}
