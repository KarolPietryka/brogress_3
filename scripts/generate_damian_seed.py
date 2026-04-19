"""Generate 003-damian-seed.sql from damian_workout, damian workout_set, damian_excercises."""
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

DAMIAN_WORKOUT = ROOT / "damian_workout"
DAMIAN_SET = ROOT / "damian workout_set"
DAMIAN_EX = ROOT / "damian_excercises"


def main() -> None:
    ex_by_id: dict[int, tuple[str, str]] = {}
    with DAMIAN_EX.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            eid = int(row["id"])
            name = row["name"].strip('"').replace("'", "''")
            bp = row["body_part"].strip('"').replace("'", "''")
            ex_by_id[eid] = (name, bp)

    workouts: list[tuple[int, str]] = []
    with DAMIAN_WORKOUT.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            workouts.append((int(row["id"]), row["workout_date"]))
    workouts.sort(key=lambda t: t[0])
    if not workouts:
        raise SystemExit("no workouts in damian_workout")

    old_wid_to_new: dict[int, int] = {}
    lines: list[str] = [
        "-- Damian: user szldam + exercises + workouts/workout_exercises (from damian_* exports)",
        "INSERT INTO users (nick, password_hash) VALUES ('szldam', 'szldam');",
        "",
    ]

    ex_rows_sorted = sorted(ex_by_id.items(), key=lambda x: x[0])
    for _eid, (name, bp) in ex_rows_sorted:
        lines.append(
            "INSERT INTO exercises (user_id, name, body_part) "
            f"SELECT u.id, '{name}', '{bp}' FROM users u WHERE u.nick = 'szldam';"
        )

    lines.append("")
    next_wid = _next_workout_id()
    lines.append(
        f"-- next workout id after 002-legacy (expects {next_wid}); adjust if changelogs differ"
    )

    wvals = []
    for new_id, (old_id, wdate) in enumerate(workouts, start=next_wid):
        old_wid_to_new[old_id] = new_id
        wvals.append(
            f"SELECT {new_id}, u.id, DATE '{wdate}' FROM users u WHERE u.nick = 'szldam'"
        )
    lines.append(
        "INSERT INTO workouts (id, user_id, workout_date)\n"
        + " UNION ALL\n".join(wvals)
        + ";"
    )

    set_rows: list[tuple[int, int, int, str, str, int, int]] = []
    with DAMIAN_SET.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("status") != "DONE":
                continue
            oid = int(row["id"])
            wid_old = int(row["workout_id"])
            eid = int(row["exercise_id"])
            if eid not in ex_by_id:
                raise SystemExit(f"exercise_id {eid} missing in damian_excercises")
            name, _canonical_bp = ex_by_id[eid]
            w_new = old_wid_to_new[wid_old]
            reps = int(row["repetitions"])
            sort_order = int(row["line_order"])
            wint = int(round(float(row["weight"])))
            bp = row["body_part"].strip('"').replace("'", "''")
            en = name.replace("'", "''")
            set_rows.append((w_new, sort_order, oid, wint, reps, bp, en))
    set_rows.sort(key=lambda t: (t[0], t[1], t[2]))

    next_se_id = _next_set_id()
    evs = []
    for i, (w_new, sort_order, _oid, wint, reps, bp, en) in enumerate(set_rows):
        seq = next_se_id + i
        evs.append(f"({seq}, {w_new}, '{bp}', '{en}', {wint}, {reps}, {sort_order})")

    lines.append("")
    lines.append("INSERT INTO workout_exercises (id, workout_id, body_part, exercise_name, weight, reps, sort_order) VALUES")
    lines.append(",\n".join(evs) + ";")

    max_w = next_wid + len(workouts) - 1
    max_se = next_se_id + len(set_rows) - 1
    max_ex = _kapiet_ex_count() + len(ex_by_id)

    lines.append("")
    lines.append(f"ALTER TABLE workouts ALTER COLUMN id RESTART WITH {max_w + 1};")
    lines.append(f"ALTER TABLE workout_exercises ALTER COLUMN id RESTART WITH {max_se + 1};")
    lines.append(f"ALTER TABLE exercises ALTER COLUMN id RESTART WITH {max_ex + 1};")

    out = ROOT / "backend/src/main/resources/db/changelog/changes/003-damian-seed.sql"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT)}: user szldam, {len(ex_by_id)} exercises, {len(workouts)} workouts, {len(set_rows)} sets")


def _next_workout_id() -> int:
    """After 002: workouts 1..13 -> next id 14."""
    return 14


def _next_set_id() -> int:
    """After 002: sets 1..143 -> next id 144."""
    return 144


def _kapiet_ex_count() -> int:
    """Exercises inserted in 001-03 for kapiet (must match 001-baseline.xml)."""
    return 23


if __name__ == "__main__":
    main()
