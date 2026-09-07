# Lab 1 Submission Checklist

Project: Player Value Atlas
Course: CSE/ISE 332 Introduction to Visualization

## Brightspace uploads

### 1. Voice-narrated video

File: `video intro.mp4`

The video should demonstrate:

- categorical variable selected with a bar chart;
- numerical variable selected with an equal-width histogram;
- upright and sideways orientation;
- two-variable scatterplot;
- selected-variable x/y axis assignment;
- chart titles, axis labels, units, and tooltips.

### 2. Report

File: `report/report.md`

The report includes:

- public source URLs;
- data fusion method;
- attribute descriptions;
- why the data are interesting;
- implementation notes;
- limitations;
- GitHub Copilot AI-use statement.

Convert the Markdown report to PDF or DOCX if Brightspace requires a document format.

### 3. Source-code ZIP

Recommended archive contents:

- `index.html`
- `style.css`
- `script.js`
- `build_dataset.py`
- `README.md`
- `data/fused_players.csv`
- `data/fused_players.xlsx`
- `data/data_dictionary.md`
- `data/quality_report.txt`
- `report/report.md`
- `report/recording_script.md`
- `SUBMISSION_CHECKLIST.md`

Do not include `data/raw/`; those source files are large and are reproducibly downloaded by `build_dataset.py`.

### 4. Fused spreadsheet

File: `data/fused_players.xlsx`

Verified contents:

- one worksheet;
- 59,137 data records plus a header row;
- 21 columns;
- five European leagues;
- player-season-team-league analysis unit.

## GitHub repository

Repository: https://github.com/GALACTUS06/football-player-value-lab

GitHub contains the source code, fused CSV, Excel table, documentation, and report draft. The 145.7 MB video is intentionally not pushed to the normal GitHub repository because it exceeds GitHub's regular 100 MB file limit. Upload the video directly to Brightspace.

## Final pre-upload checks

- [ ] Open the video and confirm audio is understandable.
- [ ] Show `Position` as a bar chart.
- [ ] Show `Market Value` as a histogram.
- [ ] Toggle Upright and Sideways.
- [ ] Show `Market Value` vs `Goals` as a scatterplot.
- [ ] Toggle the selected-variable axis from x to y.
- [ ] Show at least one tooltip.
- [ ] Export the report to PDF/DOCX if required.
- [ ] Upload the video, report, source ZIP, and Excel sheet to Brightspace.
- [ ] Include the AI-use statement in the report.
