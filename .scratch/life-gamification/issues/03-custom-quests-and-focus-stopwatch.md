# 03: Custom quest creation, daily quest log, and focus stopwatch

**What to build:** The questing and real-time focus productivity system. A user can author custom Quests with custom titles, an optional link to an Activity, and a selectable XP reward (+15m, +30m, +45m, +1h, +2h). The right column displays the Parchment Quest Log with tabs for "Today's Quests" and "Backlog". Clicking "Complete" on any quest immediately awards bonus minutes/XP to the linked Activity, triggers level and rank recalculation, and moves the quest to completed status with celebratory visual feedback. Additionally, a built-in focus stopwatch allows users to measure active sessions in real time and save them directly as time logs.

**Blocked by:** 02: Greek pantheon progression engine and hero character sheet

**Status:** ready-for-agent

- [ ] Dexie database schema updated to include `quests` table with indexes: `'id, activityId, status, dueDate, completedAt, [status+dueDate], [activityId+status]'`.
- [ ] User can create custom quests with title, optional activity link, and XP reward (+15m, +30m, +45m, +1h, +2h).
- [ ] Parchment Quest Log component renders tabs for "Today's Quests" and "Backlog" with badge tags displaying rewards.
- [ ] Completing a quest atomically marks it `'completed'`, logs corresponding XP minutes to the linked Activity, and recalculates levels.
- [ ] Integrated Focus Stopwatch lets users start, pause, and stop an active timer on any activity, logging the elapsed time in a single click.
- [ ] Automated tests verify quest creation, completion state transitions, XP award propagation, and stopwatch logging.
