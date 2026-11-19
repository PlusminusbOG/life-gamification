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

## Not yet specified

- **Cloud Sync Strategy**: Multi-device synchronization protocol (CRDT vs CouchDB/Supabase) when syncing across devices in a future phase.
- **Sound & Micro-interactions**: Audio feedback, celebration confetti, and haptic feedback triggers upon quest completion or level up.
- **Pomodoro & Focus Intervals**: Break interval configuration, system notifications, and sound alerts for the focus timer.
- **Custom User Achievements**: Allowing users to create their own custom milestones and rules beyond system presets.

## Out of scope

- Multiplayer guilds, leaderboards, and competitive ranking (strictly personal single-player journey for MVP).
- Paid monetization, paywalls, or subscription models.
- Native mobile app store releases (PWA covers desktop and mobile without app store friction).
