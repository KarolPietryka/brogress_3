export type ExerciseLine = {
  id: string;
  muscle: string;
  name: string;
  weight: string;
  reps: string;
  done: boolean;
};

export type WorkoutTemplate = {
  id: string;
  label: string;
  exercises: ExerciseLine[];
};

const push: WorkoutTemplate = {
  id: "push",
  label: "Push A",
  exercises: [
    {
      id: "1",
      muscle: "Klatka",
      name: "Wyciskanie sztangi",
      weight: "80",
      reps: "5",
      done: false,
    },
    {
      id: "2",
      muscle: "Barki",
      name: "Wyciskanie hantli siedząc",
      weight: "22",
      reps: "10",
      done: false,
    },
    {
      id: "3",
      muscle: "Triceps",
      name: "Prostowanie linek",
      weight: "25",
      reps: "12",
      done: false,
    },
  ],
};

const pull: WorkoutTemplate = {
  id: "pull",
  label: "Pull B",
  exercises: [
    {
      id: "1",
      muscle: "Plecy",
      name: "Martwy ciąg rumuński",
      weight: "100",
      reps: "8",
      done: false,
    },
    {
      id: "2",
      muscle: "Plecy",
      name: "Podciąganie nachwytem",
      weight: "0",
      reps: "8",
      done: false,
    },
    {
      id: "3",
      muscle: "Biceps",
      name: "Uginanie młotkowe",
      weight: "16",
      reps: "10",
      done: false,
    },
  ],
};

const legs: WorkoutTemplate = {
  id: "legs",
  label: "Nogi C",
  exercises: [
    {
      id: "1",
      muscle: "Nogi",
      name: "Przysiad ze sztangą",
      weight: "110",
      reps: "5",
      done: false,
    },
    {
      id: "2",
      muscle: "Nogi",
      name: "Wykroki chodzone",
      weight: "24",
      reps: "10",
      done: false,
    },
    {
      id: "3",
      muscle: "Dwugłowe",
      name: "Żuraw nordycki",
      weight: "12",
      reps: "12",
      done: false,
    },
  ],
};

export const TEMPLATES: WorkoutTemplate[] = [push, pull, legs];

const LAST_KEY = "brogress:lastWorkout";

export function loadLastWorkoutFromProfile(): WorkoutTemplate | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkoutTemplate;
  } catch {
    return null;
  }
}

export function persistLastWorkout(template: WorkoutTemplate): void {
  const snapshot: WorkoutTemplate = {
    ...template,
    exercises: template.exercises.map((e) => ({ ...e })),
  };
  localStorage.setItem(LAST_KEY, JSON.stringify(snapshot));
}

export function cloneTemplate(t: WorkoutTemplate): WorkoutTemplate {
  return {
    ...t,
    exercises: t.exercises.map((e) => ({ ...e, id: crypto.randomUUID() })),
  };
}
