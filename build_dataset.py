import csv
import datetime as dt
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).parent
RAW = ROOT / "data" / "raw"
OUTPUT = ROOT / "data" / "fused_players.csv"
QUALITY = ROOT / "data" / "quality_report.txt"
LEAGUES = {"Premier League", "LaLiga", "Bundesliga", "Serie A", "Ligue 1"}
FIELDS = [
    "player_name", "season", "league", "team", "position", "age", "market_value",
    "matches", "starts", "minutes", "goals", "assists", "own_goals", "subed_in",
    "subed_out", "yellow_cards", "second_yellow_cards", "direct_red_cards",
    "penalty_goals", "goals_conceded", "clean_sheets",
]


def number(value, default=0):
    if value in (None, "", "-"):
        return default
    try:
        return float(value)
    except ValueError:
        return default


def season_window(season):
    start = int("20" + season[:2])
    return dt.date(start, 7, 1), dt.date(start + 1, 6, 30)


def age_on_season_start(date_of_birth, season):
    try:
        birth = dt.date.fromisoformat(date_of_birth)
        start, _ = season_window(season)
        return start.year - birth.year - ((start.month, start.day) < (birth.month, birth.day))
    except (TypeError, ValueError):
        return ""


def load_profiles():
    profiles = {}
    with (RAW / "player_profiles.csv").open(encoding="utf-8", newline="") as stream:
        for row in csv.DictReader(stream):
            profiles[row["player_id"]] = row
    return profiles


def load_values():
    values = defaultdict(list)
    with (RAW / "player_market_value.csv").open(encoding="utf-8", newline="") as stream:
        for row in csv.DictReader(stream):
            try:
                values[row["player_id"]].append((dt.date.fromisoformat(row["date_unix"]), float(row["value"])))
            except (TypeError, ValueError):
                continue
    for player_id in values:
        values[player_id].sort()
    return values


def market_value(player_values, season):
    start, end = season_window(season)
    candidates = [(date, value) for date, value in player_values if start <= date <= end]
    return candidates[-1][1] / 1_000_000 if candidates else ""


def main():
    profiles = load_profiles()
    values = load_values()
    records = []
    skipped = 0
    with (RAW / "player_performances.csv").open(encoding="utf-8", newline="") as stream:
        for row in csv.DictReader(stream):
            if row["competition_name"] not in LEAGUES or not row["season_name"]:
                continue
            season = row["season_name"]
            profile = profiles.get(row["player_id"], {})
            value = market_value(values.get(row["player_id"], []), season)
            if value == "":
                skipped += 1
                continue
            records.append({
                "player_name": profile.get("player_name") or f"Player {row['player_id']}",
                "season": season,
                "league": row["competition_name"],
                "team": row["team_name"],
                "position": profile.get("main_position", profile.get("position", "Unknown")),
                "age": age_on_season_start(profile.get("date_of_birth"), season),
                "market_value": round(value, 3),
                "matches": number(row["nb_in_group"]),
                "starts": number(row["nb_on_pitch"]),
                "minutes": number(row["minutes_played"]),
                "goals": number(row["goals"]),
                "assists": number(row["assists"]),
                "own_goals": number(row["own_goals"]),
                "subed_in": number(row["subed_in"]),
                "subed_out": number(row["subed_out"]),
                "yellow_cards": number(row["yellow_cards"]),
                "second_yellow_cards": number(row["second_yellow_cards"]),
                "direct_red_cards": number(row["direct_red_cards"]),
                "penalty_goals": number(row["penalty_goals"]),
                "goals_conceded": number(row["goals_conceded"]),
                "clean_sheets": number(row["clean_sheets"]),
            })

    unique = {(r["player_name"], r["season"], r["team"], r["league"]): r for r in records}
    records = list(unique.values())
    with OUTPUT.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(records)
    QUALITY.write_text(
        f"rows={len(records)}\ncolumns={len(FIELDS)}\nleagues={sorted(LEAGUES)}\n"
        f"records_without_season_value={skipped}\nduplicate_keys_removed={len(unique) - len(records)}\n",
        encoding="utf-8",
    )
    print(f"wrote {len(records)} rows and {len(FIELDS)} columns to {OUTPUT}")


if __name__ == "__main__":
    main()