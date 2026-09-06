# Player Value Atlas

D3.js visualization for CSE/ISE 332 Lab 1. The project studies football player performance and market value using one row per player-season-team record.

## Dataset status

The current `data/fused_players.csv` is a reproducible fused dataset with 59,097 player-season-team records and 21 attributes. It covers the Premier League, LaLiga, Bundesliga, Serie A, and Ligue 1. The source files are downloaded by `build_dataset.py` into `data/raw/` and are excluded from Git because the performance source is large.

## Run locally

Because browsers block local CSV requests from `file://`, run a static server from this folder. For example, with Python:

```text
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Lab coverage

- Variable dropdown for distribution views
- Category count bar chart
- Equal-width histogram for numeric variables
- Upright and sideways orientation controls
- Two-variable scatterplot
- Selected-variable x/y axis assignment
- Numeric, categorical, and mixed scatterplot axes with jitter for categorical values
- Tooltips with player, team, season, and selected values

## Data sources and fusion

The project uses the public [football-datasets](https://github.com/salimt/football-datasets) repository, which provides Transfermarkt-derived player profiles, player-season performance, and dated market-value records:

- Performance: `https://media.githubusercontent.com/media/salimt/football-datasets/main/datalake/transfermarkt/player_performances/player_performances.csv`
- Market value: `https://raw.githubusercontent.com/salimt/football-datasets/main/datalake/transfermarkt/player_market_value/player_market_value.csv`
- Profiles: `https://raw.githubusercontent.com/salimt/football-datasets/main/datalake/transfermarkt/player_profiles/player_profiles.csv`

Run `python build_dataset.py` after downloading the source files into `data/raw/`. The script filters the five leagues, matches market values inside each season window, joins profile fields, removes duplicate player-season-team-league keys, and writes the final CSV plus `data/quality_report.txt`.
