import {
  useEffect,
  useMemo,
  useState,
  type DragEvent as ReactDragEvent,
  type FocusEvent as ReactFocusEvent,
} from "react";
import { TemplateCarousel } from "../components/TemplateCarousel";
import {
  TEMPLATES,
  cloneTemplate,
  loadLastWorkoutFromProfile,
  persistLastWorkout,
  type ExerciseLine,
  type WorkoutTemplate,
} from "../data/templates";
import {
  COMPOSER_MUSCLE_OPTIONS,
  MAX_REPS_INPUT_LEN,
  MAX_WEIGHT_INPUT_LEN,
  newComposerLineId,
  sanitizeOptionalDecimalInput,
} from "../lib/trainingComposerHelpers";

function lineKey(ex: ExerciseLine, index: number): string {
  return `${ex.id}-${index}`;
}

/** Seed sticky composer from the last plan row (same idea as lastDraftLineComposerPrefill). */
function tailPrefill(exercises: ExerciseLine[]): {
  muscle: string;
  weight: string;
  reps: string;
} {
  const t = exercises[exercises.length - 1];
  if (!t) {
    return {
      muscle: COMPOSER_MUSCLE_OPTIONS[0] ?? "Chest",
      weight: "0",
      reps: "",
    };
  }
  return { muscle: t.muscle, weight: t.weight, reps: t.reps };
}

/** Select all on focus (click / Tab); one-time mouseup preventDefault so selection stays. */
function selectAllOnFocus(e: ReactFocusEvent<HTMLInputElement>): void {
  const el = e.currentTarget;
  el.select();
  el.addEventListener("mouseup", (ev) => ev.preventDefault(), { once: true });
}

export function TrainingView() {
  const initial = useMemo(() => {
    const fromProfile = loadLastWorkoutFromProfile();
    if (fromProfile) return cloneTemplate(fromProfile);
    return cloneTemplate(TEMPLATES[0]!);
  }, []);

  const [activeTemplateId, setActiveTemplateId] = useState(initial.id);
  const [rows, setRows] = useState<ExerciseLine[]>(initial.exercises);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | "end" | null>(
    null,
  );

  const pre0 = tailPrefill(initial.exercises);
  const [composerMuscle, setComposerMuscle] = useState(pre0.muscle);
  const [composerName, setComposerName] = useState("");
  const [composerWeight, setComposerWeight] = useState(pre0.weight);
  const [composerReps, setComposerReps] = useState(pre0.reps);
  const [composerFlash, setComposerFlash] = useState(false);

  useEffect(() => {
    const snapshot: WorkoutTemplate = {
      id: activeTemplateId,
      label:
        TEMPLATES.find((t) => t.id === activeTemplateId)?.label ?? "Custom",
      exercises: rows,
    };
    persistLastWorkout(snapshot);
  }, [activeTemplateId, rows]);

  /** While dragging, auto-scroll when the pointer hugs the top/bottom of the viewport (mobile long lists). */
  useEffect(() => {
    if (draggingIndex === null) return;

    const edgeRatio = 0.18;
    const maxStep = 28;
    const minStep = 5;

    const onDragOver = (e: DragEvent) => {
      const h =
        typeof window.visualViewport !== "undefined" && window.visualViewport
          ? window.visualViewport.height
          : window.innerHeight;
      const margin = Math.max(64, h * edgeRatio);
      const y = e.clientY;

      if (y > h - margin) {
        const t = (y - (h - margin)) / margin;
        const step = minStep + Math.min(1, Math.max(0, t)) * (maxStep - minStep);
        window.scrollBy({ top: Math.round(step), behavior: "auto" });
      } else if (y < margin) {
        const t = (margin - y) / margin;
        const step = minStep + Math.min(1, Math.max(0, t)) * (maxStep - minStep);
        window.scrollBy({ top: -Math.round(step), behavior: "auto" });
      }
    };

    document.addEventListener("dragover", onDragOver);
    return () => document.removeEventListener("dragover", onDragOver);
  }, [draggingIndex]);

  function applyTemplate(t: WorkoutTemplate) {
    setActiveTemplateId(t.id);
    const exs = cloneTemplate(t).exercises;
    setRows(exs);
    const pre = tailPrefill(exs);
    setComposerMuscle(pre.muscle);
    setComposerWeight(pre.weight);
    setComposerReps(pre.reps);
    setComposerName("");
  }

  function addExerciseFromComposer() {
    const name = composerName.trim();
    if (!name) return;
    const line: ExerciseLine = {
      id: newComposerLineId(),
      muscle: composerMuscle,
      name,
      weight: composerWeight || "0",
      reps: composerReps,
      done: false,
    };
    setRows((prev) => [...prev, line]);
    setComposerName("");
    setComposerMuscle(line.muscle);
    setComposerWeight(line.weight);
    setComposerReps(line.reps);
    setComposerFlash(true);
  }

  function updateRow(index: number, patch: Partial<ExerciseLine>) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  /** Drop on a row swaps the dragged row with that row (two items exchange places). */
  function swapRows(a: number, b: number) {
    if (a === b) return;
    setRows((prev) => {
      const next = [...prev];
      const rowA = next[a];
      const rowB = next[b];
      if (rowA === undefined || rowB === undefined) return prev;
      next[a] = rowB;
      next[b] = rowA;
      return next;
    });
  }

  /** Drop on the tail zone moves the row to the last position. */
  function moveRowToEnd(from: number) {
    setRows((prev) => {
      if (from < 0 || from >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      if (item === undefined) return prev;
      next.push(item);
      return next;
    });
  }

  function toggleDone(index: number) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, done: !r.done } : r)),
    );
  }

  return (
    <div className="trainingView">
      <div className="trainingView-head">
        <h1 className="panel-title">{"Today's workout"}</h1>
      </div>

      <div className="template">
        <div className="groupHeader">Templates</div>
        <TemplateCarousel
          templates={TEMPLATES}
          activeTemplateId={activeTemplateId}
          onSelectTemplate={applyTemplate}
        />

        <div className="workoutComposerBlock">
          <form
            className={`exerciseRow exerciseRow--composer${
              composerFlash ? " exerciseRow--composerFlash" : ""
            }`}
            aria-label="Add new exercise"
            onSubmit={(e) => {
              e.preventDefault();
              addExerciseFromComposer();
            }}
            onAnimationEnd={(e) => {
              if (e.target !== e.currentTarget) return;
              if (!e.animationName.includes("composerRowBlueFlash")) return;
              setComposerFlash(false);
            }}
          >
            <div className="dragHandleSpacer" aria-hidden />
            <div className="exerciseNameCell exerciseNameCell--composer">
              <select
                className="composerPickTrigger composerPickTrigger--group"
                aria-label="Muscle group"
                value={composerMuscle}
                onChange={(e) => setComposerMuscle(e.target.value)}
              >
                {!COMPOSER_MUSCLE_OPTIONS.includes(composerMuscle) ? (
                  <option value={composerMuscle}>{composerMuscle}</option>
                ) : null}
                {COMPOSER_MUSCLE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="composerExerciseInput composerPickTrigger--exercise"
                autoComplete="off"
                placeholder="Exercise name"
                value={composerName}
                onChange={(e) => setComposerName(e.target.value)}
                aria-label="Exercise name"
              />
            </div>
            <div className="exerciseFields">
              <input
                className="numField"
                inputMode="decimal"
                maxLength={MAX_WEIGHT_INPUT_LEN}
                placeholder="Weight"
                value={composerWeight}
                onChange={(e) =>
                  setComposerWeight(
                    sanitizeOptionalDecimalInput(
                      e.target.value,
                      MAX_WEIGHT_INPUT_LEN,
                    ),
                  )
                }
                onFocus={selectAllOnFocus}
                aria-label="Weight kg"
              />
              <input
                className="numField"
                inputMode="decimal"
                maxLength={MAX_REPS_INPUT_LEN}
                placeholder="Reps"
                value={composerReps}
                onChange={(e) =>
                  setComposerReps(
                    sanitizeOptionalDecimalInput(
                      e.target.value,
                      MAX_REPS_INPUT_LEN,
                    ),
                  )
                }
                onFocus={selectAllOnFocus}
                aria-label="Repetitions"
              />
            </div>
            <button
              type="submit"
              className="rowAdd"
              disabled={!composerName.trim()}
              aria-label="Add exercise to plan"
            >
              +
            </button>
          </form>
        </div>

        <div className="grouped">
          <div className="groupHeaderRow">
            <h2 className="groupHeader">Plan</h2>
            <span className="pill">
              {rows.filter((r) => r.done).length}/{rows.length} done
            </span>
          </div>

          <div className="checks checks--draftFlip">
            {rows.length === 0 ? (
              <div className="empty workoutPlanEmpty">
                No rows yet — pick a template or add exercises (next UI
                iteration).
              </div>
            ) : (
              <>
                {rows.map((ex, index) => (
                  <div
                    key={lineKey(ex, index)}
                    className={`exerciseRow ${ex.done ? "exerciseRow--done" : "exerciseRow--planned"}${
                      draggingIndex === index ? " exerciseRow--dragging" : ""
                    }${
                      dragOverIndex === index && draggingIndex !== index
                        ? " exerciseRow--dragOver"
                        : ""
                    }`}
                    onDragOver={(e: ReactDragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDragOverIndex(index);
                    }}
                    onDrop={(e: ReactDragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      const from = Number.parseInt(
                        e.dataTransfer.getData("text/plain"),
                        10,
                      );
                      if (Number.isNaN(from)) return;
                      swapRows(from, index);
                      setDraggingIndex(null);
                      setDragOverIndex(null);
                    }}
                  >
                    <div
                      className="dragHandle"
                      draggable
                      title="Drop on a row to swap, or below the list to move to end"
                      aria-label={`Swap row: ${ex.name}`}
                      onDragStart={(e: ReactDragEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        setDraggingIndex(index);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(index));
                      }}
                      onDragEnd={() => {
                        setDraggingIndex(null);
                        setDragOverIndex(null);
                      }}
                    >
                      <span className="dragHandleGrip" aria-hidden />
                    </div>
                  <div className="exerciseLeft">
                    <button
                      type="button"
                      className="exerciseLeft-toggle"
                      onClick={() => toggleDone(index)}
                      aria-pressed={ex.done}
                      aria-label={`${ex.name} — ${ex.done ? "done" : "pending"}`}
                    >
                      <div className="exerciseNameCell">
                        <span className="muscleTag">{ex.muscle}</span>
                        <span className="check-text">{ex.name}</span>
                      </div>
                    </button>
                    <div
                      className="exerciseBarSets"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <span className="exerciseBarUnit">kg</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="numField numField--bar"
                        autoComplete="off"
                        value={ex.weight}
                        onFocus={selectAllOnFocus}
                        onChange={(e) =>
                          updateRow(index, { weight: e.target.value })
                        }
                        aria-label={`Weight in kg: ${ex.name}`}
                      />
                      <span className="exerciseBarTimes" aria-hidden>
                        ×
                      </span>
                      <input
                        type="text"
                        className="numField numField--bar numField--barReps"
                        autoComplete="off"
                        value={ex.reps}
                        onFocus={selectAllOnFocus}
                        onChange={(e) =>
                          updateRow(index, { reps: e.target.value })
                        }
                        aria-label={`Repetitions: ${ex.name}`}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rowRemove"
                    aria-label={`Remove ${ex.name}`}
                    onClick={() => removeRow(index)}
                  >
                    ×
                  </button>
                </div>
                ))}
                <div
                  className={`workoutEndDrop${
                    dragOverIndex === "end" ? " workoutEndDrop--dragOver" : ""
                  }`}
                  onDragOver={(e: ReactDragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragOverIndex("end");
                  }}
                  onDrop={(e: ReactDragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    const from = Number.parseInt(
                      e.dataTransfer.getData("text/plain"),
                      10,
                    );
                    if (Number.isNaN(from)) return;
                    moveRowToEnd(from);
                    setDraggingIndex(null);
                    setDragOverIndex(null);
                  }}
                  aria-label="Drop to move exercise to end of list"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
