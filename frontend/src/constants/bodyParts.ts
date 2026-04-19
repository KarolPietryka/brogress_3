/** Matches backend `BodyPart` and PRODUCT-BRIEF — sticky row / exercise picker. */
export const BODY_PARTS = [
  "shoulders",
  "arms",
  "chest",
  "abs",
  "back",
  "legs",
] as const;

export type BodyPartId = (typeof BODY_PARTS)[number];

/** English labels for UI (templates use similar wording). */
export const BODY_PART_LABELS: Record<BodyPartId, string> = {
  shoulders: "Shoulders",
  arms: "Arms",
  chest: "Chest",
  abs: "Abs",
  back: "Back",
  legs: "Legs",
};

/** Map legacy template `muscle` strings → API body-part id. */
/** Map API `bodyPart` string (e.g. from ExerciseDto) to picker id. */
export function parseBodyPartId(raw: string): BodyPartId | null {
  const s = raw.trim().toLowerCase();
  return (BODY_PARTS as readonly string[]).includes(s) ? (s as BodyPartId) : null;
}

export function templateMuscleToBodyPartId(muscle: string): BodyPartId {
  const map: Record<string, BodyPartId> = {
    Chest: "chest",
    Back: "back",
    Shoulders: "shoulders",
    Legs: "legs",
    Biceps: "arms",
    Triceps: "arms",
    Hamstrings: "legs",
    Core: "abs",
    Calves: "legs",
    Forearms: "arms",
    Other: "chest",
  };
  return map[muscle] ?? "chest";
}
