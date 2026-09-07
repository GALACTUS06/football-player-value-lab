# Player Value Atlas: report draft

## Research question

How are football (soccer) players' season performance measures associated with their estimated market value across multiple seasons and the European big-five leagues?

This project will treat the relationship as descriptive association, not proof that performance causes market value.

## Data sources

The final report lists these public source URLs:

1. Market-value source: `https://raw.githubusercontent.com/salimt/football-datasets/main/datalake/transfermarkt/player_market_value/player_market_value.csv`
2. Player-season performance source: `https://media.githubusercontent.com/media/salimt/football-datasets/main/datalake/transfermarkt/player_performances/player_performances.csv`
3. Player profile source: `https://raw.githubusercontent.com/salimt/football-datasets/main/datalake/transfermarkt/player_profiles/player_profiles.csv`

The fused output contains 59,137 records and 21 attributes. The source repository was accessed on 2026-09-06.

## Attributes

The attributes are documented in `data/data_dictionary.md`. They include categorical variables such as league, team, season, and position, and numerical variables such as market value, age, matches, starts, minutes, goals, assists, substitutions, clean sheets, and disciplinary counts.

## Why these data are interesting

Market value is a compact way to study how different dimensions of a player's contribution appear together in an association-football ecosystem. A visualization can show whether high-value players are concentrated in particular positions or leagues, whether minutes and goals have visible associations with value, and whether the same statistical profile varies across seasons. The interface supports comparisons without reducing the entire question to a single ranking.

## Data fusion and cleaning

The final table uses one row per player-season-team-league record. Player IDs connect performance, market-value, and profile data. Market values are converted from EUR to millions of EUR and matched to dates between July 1 and June 30 of each season. Records without a value in that season window are excluded. The build produced 59,137 rows, 21 columns, removed zero duplicate keys, and excluded 19,455 performance rows without a season-window value. Eighty-four records have no age because the profile source lacks a usable birth date; required chart fields are otherwise populated.

The same verified table is exported as `data/fused_players.xlsx` with one worksheet for the spreadsheet submission.

## Implementation

The web interface uses D3.js and a local CSV file. It provides:

- a dropdown for selecting a distribution variable;
- category-count bar charts for categorical variables;
- fixed-width histograms for numerical variables;
- upright and sideways chart orientation;
- two-variable scatterplots;
- x/y axis assignment for the selected scatter variable;
- categorical axes with jitter for mixed and categorical scatterplots;
- tooltips showing player, team, season, and selected values.

## AI use statement

Tool used: GitHub Copilot.

Use: initial HTML/CSS/D3 scaffold, event callback suggestions, chart update structure, and debugging guidance.

Student work: selection and evaluation of the football topic, final data-source decisions, data cleaning and fusion, field definitions, visual design decisions, testing, interpretation, and any changes made after inspecting the code.

## Limitations

Market values are estimates and may reflect transfer-market context, contract status, age, reputation, and league effects in addition to measured performance. Source definitions for assists, passes, and market value may differ, so the final report must preserve the source definitions and avoid overinterpreting cross-source comparisons.
