# Data dictionary

The assignment unit is one player-season-team record. The current CSV contains the fused public dataset used by the interface: 59,137 records and 21 attributes across five European leagues.

| Field | Type | Meaning | Unit |
|---|---|---|---|
| player_name | categorical | Player name | text |
| season | categorical | Competition season | YYYY-YY |
| league | categorical | Competition league | text |
| team | categorical | Player team in the season | text |
| position | categorical | Primary playing position | text |
| age | numeric | Player age during season | years |
| market_value | numeric | Latest dated market value within the season window | millions of EUR |
| matches | numeric | Matches played | count |
| starts | numeric | Matches started | count |
| minutes | numeric | Minutes played | minutes |
| goals | numeric | Goals scored | count |
| assists | numeric | Assists | count |
| shots | numeric | Total shots | count |
| shots_on_target | numeric | Shots on target | count |
| passes | numeric | Passes attempted/completed according to source definition | count |
| pass_completion | numeric | Pass completion rate | percent |
| tackles | numeric | Tackles | count |
| interceptions | numeric | Interceptions | count |
| yellow_cards | numeric | Yellow cards | count |
| red_cards | numeric | Red cards | count |

## Source and processing rules

- Use the traceable public `salimt/football-datasets` repository, with separate player-market-value, player-performance, and player-profile tables.
- Standardize player names, team names, and season labels before joining.
- Join on `player_key + season + team_key`; do not join on player name alone.
- Record unmatched rows, duplicate keys, missing values, source URLs, download dates, and unit conversions in the report.
- Keep at least 500 valid records and 15 or more attributes in the submitted fused table.

The exact source URLs and transformation steps are recorded in `README.md`, `report/report.md`, and `build_dataset.py`.

There are 84 records without an age because the profile source does not provide a usable birth date. Other required fields have no blank values; missing names are replaced with a stable `Player <id>` fallback during the build.
