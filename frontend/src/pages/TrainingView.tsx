import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type FocusEvent as ReactFocusEvent,
} from "react";
import { ComposerPickListPortal } from "../components/ComposerPickListPortal";
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
  BODY_PART_LABELS,
  BODY_PARTS,
  parseBodyPartId,
  templateMuscleToBodyPartId,
  type BodyPartId,
} from "../constants/bodyParts";
import { getAuthToken } from "../lib/authToken";
import {
  fetchExerciseById,
  fetchExercisesForBodyPart,
  type ExerciseDto,
} from "../lib/exercisesApi";
import {
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
  bodyPartId: BodyPartId;
  weight: string;
  reps: string;
} {
  const t = exercises[exercises.length - 1];
  if (!t) {
    return {
      bodyPartId: "chest",
      weight: "0",
      reps: "",
    };
  }
  return {
    bodyPartId: templateMuscleToBodyPartId(t.muscle),
    weight: t.weight,
    reps: t.reps,
  };
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
  const [composerBodyPartId, setComposerBodyPartId] = useState<BodyPartId>(
    pre0.bodyPartId,
  );
  const [composerExerciseName, setComposerExerciseName] = useState("");
  const [composerWeight, setComposerWeight] = useState(pre0.weight);
  const [composerReps, setComposerReps] = useState(pre0.reps);
  const [composerExerciseDbId, setComposerExerciseDbId] = useState<number | null>(
    null,
  );
  const [composerFlash, setComposerFlash] = useState(false);
  const [composerExerciseOptions, setComposerExerciseOptions] = useState<
    ExerciseDto[]
  >([]);
  const [composerExercisesLoading, setComposerExercisesLoading] =
    useState(false);
  const [composerPickOpen, setComposerPickOpen] = useState<
    "group" | "exercise" | null
  >(null);
  const groupPickAnchorRef = useRef<HTMLButtonElement>(null);
  const exercisePickAnchorRef = useRef<HTMLButtonElement>(null);

  const bodyPartPickItems = useMemo(
    () =>
      BODY_PARTS.map((id) => ({
        key: id,
        label: BODY_PART_LABELS[id],
      })),
    [],
  );

  const exercisePickItems = useMemo(() => {
    const token = getAuthToken();
    if (!token) {
      return [
        {
          key: "__signin__",
          label:
            "Sign in — set localStorage brogress.jwt or VITE_DEV_JWT",
          disabled: true as const,
        },
      ];
    }
    if (composerExercisesLoading) {
      return [{ key: "__loading__", label: "Loading exercises…", disabled: true as const }];
    }
    if (composerExerciseOptions.length === 0) {
      return [
        {
          key: "__empty__",
          label: "No exercises for this body part",
          disabled: true as const,
        },
      ];
    }
    return [
      { key: "__placeholder__", label: "— Select exercise —" },
      ...composerExerciseOptions.map((ex) => ({
        key: `ex-${ex.id}`,
        label: ex.name,
        exerciseId: ex.id,
      })),
    ];
  }, [composerExercisesLoading, composerExerciseOptions]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setComposerExerciseOptions([]);
      setComposerExercisesLoading(false);
      return;
    }
    let cancelled = false;
    setComposerExerciseOptions([]);
    setComposerExercisesLoading(true);
    fetchExercisesForBodyPart(composerBodyPartId, token)
      .then((list) => {
        if (!cancelled) setComposerExerciseOptions(list);
      })
      .catch(() => {
        if (!cancelled) setComposerExerciseOptions([]);
      })
      .finally(() => {
        if (!cancelled) setComposerExercisesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [composerBodyPartId]);

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
    setComposerBodyPartId(pre.bodyPartId);
    setComposerWeight(pre.weight);
    setComposerReps(pre.reps);
    setComposerExerciseName("");
    setComposerExerciseDbId(null);
  }

  async function fillComposerFromRow(ex: ExerciseLine) {
    const token = getAuthToken();
    let bodyPartId = templateMuscleToBodyPartId(ex.muscle);
    let name = ex.name;

    if (ex.exerciseDbId != null && token) {
      try {
        const dto = await fetchExerciseById(ex.exerciseDbId, token);
        const fromApi = parseBodyPartId(dto.bodyPart);
        if (fromApi) bodyPartId = fromApi;
        name = dto.name;
      } catch {
        /* use row muscle label + name */
      }
    }

    setComposerBodyPartId(bodyPartId);
    setComposerExerciseName(name);
    setComposerWeight(ex.weight);
    setComposerReps(ex.reps);
    setComposerExerciseDbId(ex.exerciseDbId ?? null);
    setComposerFlash(true);
  }

  function addExerciseFromComposer() {
    const name = composerExerciseName.trim();
    if (!name) return;
    const line: ExerciseLine = {
      id: newComposerLineId(),
      muscle: BODY_PART_LABELS[composerBodyPartId],
      name,
      weight: composerWeight || "0",
      reps: composerReps,
      done: false,
      ...(composerExerciseDbId != null ? { exerciseDbId: composerExerciseDbId } : {}),
    };
    setRows((prev) => [...prev, line]);
    setComposerExerciseName("");
    setComposerExerciseDbId(null);
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

  const exercisePickDisabled =
    !getAuthToken() ||
    composerExercisesLoading ||
    composerExerciseOptions.length === 0;

  return (
    <div className="trainingView">
      <ComposerPickListPortal
        open={composerPickOpen === "group"}
        title="Body part"
        items={bodyPartPickItems}
        anchorRef={groupPickAnchorRef}
        onClose={() => setComposerPickOpen(null)}
        onPick={(item) => {
          if (typeof item === "string") return;
          if (item.disabled) return;
          setComposerBodyPartId(item.key as BodyPartId);
          setComposerExerciseName("");
          setComposerExerciseDbId(null);
        }}
      />
      <ComposerPickListPortal
        open={composerPickOpen === "exercise"}
        title="Exercise"
        items={exercisePickItems}
        anchorRef={exercisePickAnchorRef}
        onClose={() => setComposerPickOpen(null)}
        onPick={(item) => {
          if (typeof item === "string") return;
          if (item.disabled) return;
          if (item.key === "__placeholder__") {
            setComposerExerciseName("");
            setComposerExerciseDbId(null);
            return;
          }
          setComposerExerciseName(item.label);
          setComposerExerciseDbId(item.exerciseId ?? null);
        }}
      />

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
              if (!e.animationName.includes("composerRowAccentFlash")) return;
              setComposerFlash(false);
            }}
          >
            <div className="dragHandleSpacer" aria-hidden />
            <div className="exerciseNameCell exerciseNameCell--composer">
              <button
                ref={groupPickAnchorRef}
                type="button"
                className="composerPickTrigger composerPickTrigger--group"
                aria-label="Body part"
                aria-haspopup="listbox"
                aria-expanded={composerPickOpen === "group"}
                onClick={() =>
                  setComposerPickOpen((p) => (p === "group" ? null : "group"))
                }
              >
                <span className="composerPickTrigger__text">
                  {BODY_PART_LABELS[composerBodyPartId]}
                </span>
              </button>
              <button
                ref={exercisePickAnchorRef}
                type="button"
                className="composerPickTrigger composerPickTrigger--exercise"
                aria-label="Exercise"
                aria-haspopup="listbox"
                aria-expanded={composerPickOpen === "exercise"}
                disabled={exercisePickDisabled}
                onClick={() =>
                  setComposerPickOpen((p) => (p === "exercise" ? null : "exercise"))
                }
              >
                <span className="composerPickTrigger__text composerPickTrigger__text--ellipsis">
                  {!getAuthToken()
                    ? "Sign in to load exercises"
                    : composerExercisesLoading
                      ? "Loading exercises…"
                      : composerExerciseOptions.length === 0
                        ? "No exercises for this body part"
                        : composerExerciseName || "— Select exercise —"}
                </span>
              </button>
            </div>
            <div className="exerciseFields exerciseBarSets">
              <span className="exerciseBarUnit">kg</span>
              <input
                type="text"
                className="numField numField--bar"
                inputMode="decimal"
                maxLength={MAX_WEIGHT_INPUT_LEN}
                autoComplete="off"
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
              <span className="exerciseBarTimes" aria-hidden>
                ×
              </span>
              <input
                type="text"
                className="numField numField--bar numField--barReps"
                inputMode="decimal"
                maxLength={MAX_REPS_INPUT_LEN}
                autoComplete="off"
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
              disabled={!composerExerciseName.trim()}
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
                    <div
                      className="exerciseLeft-toggle"
                      role="group"
                      aria-label={`${ex.name} row`}
                    >
                      <div className="exerciseNameCell">
                        <button
                          type="button"
                          className="muscleTag"
                          onClick={() => toggleDone(index)}
                          aria-pressed={ex.done}
                          aria-label={`${ex.muscle} — mark ${ex.done ? "not done" : "done"}`}
                        >
                          {ex.muscle}
                        </button>
                        <button
                          type="button"
                          className="check-text"
                          onClick={() => {
                            void fillComposerFromRow(ex);
                          }}
                          aria-label={`Load ${ex.name} into add bar`}
                        >
                          {ex.name}
                        </button>
                      </div>
                    </div>
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
