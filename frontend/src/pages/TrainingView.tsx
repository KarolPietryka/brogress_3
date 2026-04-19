import { useEffect, useMemo, useState } from "react";
import {
  TEMPLATES,
  cloneTemplate,
  loadLastWorkoutFromProfile,
  persistLastWorkout,
  type ExerciseLine,
  type WorkoutTemplate,
} from "../data/templates";

function lineKey(ex: ExerciseLine, index: number): string {
  return `${ex.id}-${index}`;
}

export function TrainingView() {
  const initial = useMemo(() => {
    const fromProfile = loadLastWorkoutFromProfile();
    if (fromProfile) return cloneTemplate(fromProfile);
    return cloneTemplate(TEMPLATES[0]!);
  }, []);

  const [activeTemplateId, setActiveTemplateId] = useState(initial.id);
  const [rows, setRows] = useState<ExerciseLine[]>(initial.exercises);

  useEffect(() => {
    const snapshot: WorkoutTemplate = {
      id: activeTemplateId,
      label:
        TEMPLATES.find((t) => t.id === activeTemplateId)?.label ?? "Własny",
      exercises: rows,
    };
    persistLastWorkout(snapshot);
  }, [activeTemplateId, rows]);

  function applyTemplate(t: WorkoutTemplate) {
    setActiveTemplateId(t.id);
    setRows(cloneTemplate(t).exercises);
  }

  function updateRow(index: number, patch: Partial<ExerciseLine>) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleDone(index: number) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, done: !r.done } : r)),
    );
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h1 className="panel-title">Dzisiejszy trening</h1>
        <p className="panel-hint">
          Start od ostatniej sesji (profil). Karuzela u góry — wybór szablonu
          (ćwiczenia, waga, powtórzenia).
        </p>
      </div>

      <div className="template">
        <div className="groupHeader">Szablony</div>
        <div
          className="templateCarousel"
          role="list"
          aria-label="Karuzela szablonów treningu"
        >
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="listitem"
              className={`choice ${activeTemplateId === t.id ? "selected" : ""}`}
              onClick={() => applyTemplate(t)}
            >
              <div className="choice-title">{t.label}</div>
              <div className="choice-sub">{t.exercises.length} ćwiczeń</div>
            </button>
          ))}
        </div>

        <div className="grouped">
          <div className="groupHeaderRow">
            <h2 className="groupHeader">Plan</h2>
            <span className="pill">
              {rows.filter((r) => r.done).length}/{rows.length} zrobione
            </span>
          </div>

          <div className="checks checks--draftFlip">
            {rows.length === 0 ? (
              <div className="empty workoutPlanEmpty">
                Brak pozycji — wybierz szablon albo dodaj ćwiczenia (kolejna
                iteracja UI).
              </div>
            ) : (
              rows.map((ex, index) => (
                <div
                  key={lineKey(ex, index)}
                  className={`exerciseRow ${ex.done ? "exerciseRow--done" : "exerciseRow--planned"}`}
                >
                  <div className="dragHandleSpacer" aria-hidden />
                  <button
                    type="button"
                    className="exerciseLeft"
                    onClick={() => toggleDone(index)}
                    aria-pressed={ex.done}
                  >
                    <input
                      type="checkbox"
                      checked={ex.done}
                      readOnly
                      tabIndex={-1}
                      aria-hidden
                    />
                    <div className="exerciseNameCell">
                      <span className="muscleTag">{ex.muscle}</span>
                      <span className="check-text">{ex.name}</span>
                    </div>
                  </button>
                  <div className="exerciseFields">
                    <input
                      className="numField"
                      inputMode="decimal"
                      placeholder="kg"
                      value={ex.weight}
                      onChange={(e) =>
                        updateRow(index, { weight: e.target.value })
                      }
                      aria-label={`Waga: ${ex.name}`}
                    />
                    <input
                      className="numField"
                      inputMode="numeric"
                      placeholder="powt."
                      value={ex.reps}
                      onChange={(e) =>
                        updateRow(index, { reps: e.target.value })
                      }
                      aria-label={`Powtórzenia: ${ex.name}`}
                    />
                  </div>
                  <button
                    type="button"
                    className="rowRemove"
                    aria-label={`Usuń ${ex.name}`}
                    onClick={() => removeRow(index)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
