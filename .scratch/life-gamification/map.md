# Map: Life Gamification MVP

Label: wayfinder:map

## Destination

Full architecture, domain model, and UI specification for an offline-first (Local-first) PWA life-gamification app with cumulative hours tracking, RPG leveling, quests, and permanent achievements, ready for `/to-spec` and `/to-tickets`.

## Notes

- Domain: Gamified personal development, RPG mechanics, time tracking, local-first productivity.
- Skills to consult: `domain-modeling`, `codebase-design`, `prototype`, `research`, `grilling`.
- Standing preferences:
  - Local-first architecture (Dexie.js / IndexedDB).
  - No penalties, zero degradation of levels or streaks.
  - Full data ownership and one-click JSON export/import.
  - Multi-platform access via responsive PWA.

## Decisions so far

<!-- the index: one line per closed ticket, enough to judge relevance, then zoom the link for the detail the ticket holds -->
- [01: Progression and XP Leveling Curve](issues/01-progression-formula.md) — High-density power curve ($L = 1 + \lfloor h^{0.6} \times 3.0 \rfloor$) with Greek Pantheon tiers (Mortal → Hero → Demigod → Titan → Olympian → God at 100+ lvl/350h) and custom quests awarding XP minutes. (Prototype: [prototypes/01-progression-formula/index.html](../../prototypes/01-progression-formula/index.html)).
- [02: Dexie.js Schema and JSON Serialization](issues/02-dexie-schema-and-export.md) — Dexie v4+ schema established using client UUIDs, compound indexes (`[activityId+timestamp]`, `[status+dueDate]`), atomic write transactions for denormalized totals, and lossless backup/restore via `dexie-export-import` with replace/merge conflict modes. (Research: [docs/research/02-dexie-schema-and-export.md](../../docs/research/02-dexie-schema-and-export.md)).

## Not yet specified

- **Cloud Sync Strategy**: Multi-device synchronization protocol (CRDT vs CouchDB/Supabase) when syncing across devices in a future phase.
- **Sound & Micro-interactions**: Audio feedback, celebration confetti, and haptic feedback triggers upon quest completion or level up.
- **Pomodoro & Focus Intervals**: Break interval configuration, system notifications, and sound alerts for the focus timer.
- **Custom User Achievements**: Allowing users to create their own custom milestones and rules beyond system presets.

## Out of scope

- Multiplayer guilds, leaderboards, and competitive ranking (strictly personal single-player journey for MVP).
- Paid monetization, paywalls, or subscription models.
- Native mobile app store releases (PWA covers desktop and mobile without app store friction).
