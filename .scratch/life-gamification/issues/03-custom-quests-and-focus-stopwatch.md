# 03: Custom quest creation, daily quest log, and focus stopwatch

**What to build:** The questing and real-time focus productivity system. A user can author custom Quests with custom titles, an optional link to an Activity, and a selectable XP reward (+15m, +30m, +45m, +1h, +2h). The right column displays the Parchment Quest Log with tabs for "Today's Quests" and "Backlog". Clicking "Complete" on any quest immediately awards bonus minutes/XP to the linked Activity, triggers level and rank recalculation, and moves the quest to completed status with celebratory visual feedback. Additionally, a built-in focus stopwatch allows users to measure active sessions in real time and save them directly as time logs.

**Blocked by:** 02: Greek pantheon progression engine and hero character sheet

**Status:** resolved

- [x] Dexie database schema updated to include `quests` table with indexes: `'id, activityId, status, dueDate, completedAt, [status+dueDate], [activityId+status]'`.
- [x] User can create custom quests with title, optional activity link, and XP reward (+15m, +30m, +45m, +1h, +2h).
- [x] Parchment Quest Log component renders tabs for "Today's Quests" and "Backlog" with badge tags displaying rewards.
- [x] Completing a quest atomically marks it `'completed'`, logs corresponding XP minutes to the linked Activity, and recalculates levels.
- [x] Integrated Focus Stopwatch lets users start, pause, and stop an active timer on any activity, logging the elapsed time in a single click.
- [x] Automated tests verify quest creation, completion state transitions, XP award propagation, and stopwatch logging.

## Answer

Implemented the Quest System and Live Focus Stopwatch in full compliance with Ticket 03:
1. **Dexie Schema & Database Migration (`src/domain/db.ts` & `src/domain/types.ts`)**:
   - Added `quests` table in Dexie version 2 with primary key `id` and indexes `'id, activityId, status, dueDate, completedAt, createdAt, [status+dueDate], [activityId+status]'`.
   - Defined `Quest`, `QuestStatus`, `CreateQuestInput`, and `CompleteQuestResult` models.
2. **Deep Module Service Seam (`GameEngineService` in `src/domain/gameEngineService.ts`)**:
   - Added `createQuest`, `getQuests`, `getQuest`, `completeQuest`, and `deleteQuest`.
   - `completeQuest` runs an atomic Dexie read-write transaction updating quest status, generating a linked `TimeLog` for the activity (if linked), incrementing activity minutes & recalculating level, and updating total hero lifetime hours and minutes with zero floating-point drift.
3. **Parchment Quest Log UI (`src/components/ParchmentQuestLog.tsx`)**:
   - Implemented scroll-styled tab navigation between «Квесты дня» (Today's Quests), «Бэклог» (Backlog), and «Секундомер» (Focus Stopwatch).
   - Displayed reward badges (`+15м XP`, `+30м XP`, `+45м XP`, `+1ч XP`, `+2ч XP`), linked activity chips, and quick completion buttons with celebratory visual feedback.
4. **Custom Quest Authoring Modal (`src/components/CreateQuestModal.tsx`)**:
   - Allows users to name the quest, choose an activity, pick from 5 selectable XP rewards, and assign to Today or Backlog.
5. **Integrated Focus Stopwatch (`src/components/FocusStopwatch.tsx`)**:
   - Real-time digital stopwatch in Greek gold styling with play, pause, reset, session notes, and one-click "Остановить и сохранить", logging active minutes directly into any chosen activity.
6. **Automated Verification & Browser Testing**:
   - 32 automated unit and integration tests passing (`vitest run`).
   - Browser agent verified end-to-end quest creation, completion with level-up reaction, and stopwatch session logging in live IndexedDB.
