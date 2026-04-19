"""One-off generator: workouts.csv + workout_set -> 002-legacy-workouts-seed.sql (BIGINT ids)."""
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

OLD_EXERCISE_ID_TO_NAME = {
    "1": "Butterfly",
    "2": "Incline Bench Press",
    "3": "Bench Press",
    "14": "Lateral Raise",
    "15": "Machine Overhead Press",
    "16": "Barbell Overhead Press",
    "24": "Sztywne bunch press",
    "27": "Leg Raise",
    "28": "Barbell Row",
    "29": "Machine Row",
    "30": "Lat Pulldown",
}


def main() -> None:
    workout_rows = []
    with (ROOT / "workouts.csv").open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            workout_rows.append((int(row["id"]), row["workout_date"]))
    workout_rows.sort(key=lambda t: t[0])
    old_wid_to_new: dict[int, int] = {
        old: idx + 1 for idx, (old, _) in enumerate(workout_rows)
    }
    dates_by_new_id = {old_wid_to_new[old]: d for old, d in workout_rows}

    lines: list[str] = [
        "-- Legacy import: workouts.csv + workout_set -> user_id = 1 (explicit BIGINT ids)",
        "INSERT INTO workouts (id, user_id, workout_date) VALUES",
    ]
    wvals = [
        f"({new_id}, 1, DATE '{dates_by_new_id[new_id]}')"
        for new_id in range(1, len(workout_rows) + 1)
    ]
    lines.append(",\n".join(wvals) + ";")
    lines.append("")
    lines.append(
        "INSERT INTO workout_exercises (id, workout_id, body_part, exercise_name, weight, reps, sort_order) VALUES"
    )

    set_rows = []
    with (ROOT / "workout_set").open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("status") != "DONE":
                continue
            oid = int(row["id"])
            wid_old = int(row["workout_id"])
            eid = row["exercise_id"]
            name = OLD_EXERCISE_ID_TO_NAME.get(eid)
            if not name:
                msg = f"missing OLD_EXERCISE_ID_TO_NAME for exercise_id={eid}"
                raise SystemExit(msg)
            w_new = old_wid_to_new[wid_old]
            reps = int(row["repetitions"])
            sort_order = int(row["line_order"])
            wint = int(round(float(row["weight"])))
            bp = row["body_part"].strip('"').replace("'", "''")
            en = name.replace("'", "''")
            set_rows.append((w_new, sort_order, oid, wint, reps, bp, en))
    set_rows.sort(key=lambda t: (t[0], t[1], t[2]))

    evs = []
    for seq_id, (w_new, sort_order, _oid, wint, reps, bp, en) in enumerate(
        set_rows, start=1
    ):
        evs.append(
            f"({seq_id}, {w_new}, '{bp}', '{en}', {wint}, {reps}, {sort_order})"
        )
    lines.append(",\n".join(evs) + ";")

    nw = len(workout_rows)
    ns = len(set_rows)
    lines.append("")
    lines.append(f"ALTER TABLE workouts ALTER COLUMN id RESTART WITH {nw + 1};")
    lines.append(f"ALTER TABLE workout_exercises ALTER COLUMN id RESTART WITH {ns + 1};")

    out = ROOT / "backend/src/main/resources/db/changelog/changes/002-legacy-workouts-seed.sql"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT)}: {nw} workouts, {ns} sets")


if __name__ == "__main__":
    main()
