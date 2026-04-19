/**
 * Input sanitizers aligned with legacy workoutHelpers.js / WorkoutModal.
 */

export const MAX_WEIGHT_INPUT_LEN = 8;
export const MAX_REPS_INPUT_LEN = 6;

export function sanitizeOptionalDecimalInput(value: string, maxLen: number): string {
  const cap = Math.max(1, maxLen);
  const str = String(value ?? "");
  let hasSep = false;
  const out: string[] = [];
  for (let i = 0; i < str.length; i++) {
    if (out.length >= cap) break;
    const c = str[i]!;
    if (c >= "0" && c <= "9") {
      out.push(c);
      continue;
    }
    if ((c === "," || c === ".") && !hasSep) {
      hasSep = true;
      out.push(c);
    }
  }
  return out.join("");
}

export function newComposerLineId(): string {
  return crypto.randomUUID();
}

/** Muscle / body-part options for the sticky composer (covers templates + room for custom). */
export const COMPOSER_MUSCLE_OPTIONS: string[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Hamstrings",
  "Core",
  "Calves",
  "Forearms",
  "Other",
];
