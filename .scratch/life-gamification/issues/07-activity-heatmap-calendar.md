# 07: GitHub-style Activity Heatmap Calendar

**What to build:** An interactive productivity heatmap calendar visualizing daily practice density across the year. The component displays a 52-week (or configurable range) contribution grid in the Greek Pantheon gold palette (`slate-900` -> `amber-950` -> `amber-600` -> `amber-400` -> `yellow-300`). Hovering over any cell reveals a detailed tooltip showing the date, total duration, and breakdown of activities logged on that day. Includes filtering by specific activity, total active days counter, and current/longest streak stats (strictly cumulative, consistent with our no-degradation philosophy).

**Blocked by:** 06: Lossless JSON backup export/import and offline PWA packaging

**Status:** resolved

- [x] Domain helper calculates daily aggregated minutes, active days, and streak statistics from time logs.
- [x] Responsive 7-row calendar grid rendering weeks with month labels and day-of-week markers.
- [x] Color intensity scale reflecting logged time (0m, 1-30m, 31-60m, 61-120m, 120m+).
- [x] Interactive tooltip showing exact date, total hours/minutes, and activity breakdown on hover/click.
- [x] Optional filter by Activity to view discipline-specific heatmaps.
- [x] Automated tests verify daily aggregation, leap year/date boundary handling, and streak calculations.
