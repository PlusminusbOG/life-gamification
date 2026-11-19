# 01: Project scaffolding, local database, and manual activity time logging

**What to build:** The foundational tracer bullet for the Life Gamification app. A user can launch the app, create a custom Activity (e.g., "Reading Books", "Running", "Coding") with a name and color, and record a completed time session (in hours or minutes) with optional notes. The app persists everything locally in IndexedDB using Dexie.js, updates the activity's total accumulated time and the hero's total life hours atomically, and displays the list of activities and total hours on the screen without needing any internet connection or remote server.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Project initialized with modern Vite + React + TypeScript + Tailwind CSS and builds cleanly.
- [ ] Dexie.js v4 database initialized with `activities`, `timeLogs`, and `userProfile` tables, using client UUIDs and `[activityId+timestamp]` compound index.
- [ ] User can create a new Activity with a unique name, optional icon, and color.
- [ ] User can log time (duration in minutes/hours and optional notes) into an Activity post-factum.
- [ ] Logging time atomically updates `activity.totalMinutes` and `userProfile.totalHours` inside a Dexie read-write transaction ($O(1)$ reads).
- [ ] UI displays total accumulated lifetime hours and per-activity cards with hours that never reset or decrease.
- [ ] Automated tests using in-memory IndexedDB verify activity creation, time logging, and atomic total hours calculations.
