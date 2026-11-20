# Map: Life Gamification MVP

Label: wayfinder:map

## Destination

Full architecture, domain model, and UI specification for an offline-first (Local-first) PWA life-gamification app with cumulative hours tracking, RPG leveling, quests, and permanent achievements. **Status: MVP 100% Implemented and Verified across all 6 tickets.**

## Completed Tickets (MVP)
- ✅ **01: Project scaffolding and time logging**: Dexie v4 storage, atomic transactions, activity management, time logging with notes.
- ✅ **02: Greek pantheon character sheet**: Variant B RPG Character Sheet, mathematical progression engine, pantheon tiers, XP progress bar.
- ✅ **03: Custom quests and focus stopwatch**: Parchment quest log (today/backlog), custom quest creation with XP rewards (+15..+120m), integrated focus stopwatch.
- ✅ **04: Declarative achievement engine and temple of achievements**: Predicate evaluation engine, 5 Greek categories, secret mystery cards, permanent non-degrading records.
- ✅ **05: Badge showcase and hero card export**: 1200x630 Retina PNG card generator, badge showcase selector (max 5), real-time preview, one-click download.
- ✅ **06: Lossless JSON backup export/import and offline PWA packaging**: Full database dump/restore with replace/merge conflict modes, PWA manifest, offline service worker, 100% round-trip fidelity.

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
- [01: Progression and XP Leveling Curve](decisions/01-progression-formula.md) — High-density power curve ($L = 1 + \lfloor h^{0.6} \times 3.0 \rfloor$) with Greek Pantheon tiers (Mortal → Hero → Demigod → Titan → Olympian → God at 100+ lvl/350h) and custom quests awarding XP minutes. (Prototype: [prototypes/01-progression-formula/index.html](../../prototypes/01-progression-formula/index.html)).
- [02: Dexie.js Schema and JSON Serialization](decisions/02-dexie-schema-and-export.md) — Dexie v4+ schema established using client UUIDs, compound indexes (`[activityId+timestamp]`, `[status+dueDate]`), atomic write transactions for denormalized totals, and lossless backup/restore via `dexie-export-import` with replace/merge conflict modes. (Research: [docs/research/02-dexie-schema-and-export.md](../../docs/research/02-dexie-schema-and-export.md)).
- [03: Achievement Trigger and Evaluation Engine](decisions/03-achievement-engine.md) — Declarative pure predicates evaluated in write transactions, 4 Greek myth categories (Дары Кроноса, Подвиги Геракла, Нить Ариадны, Семь Муз), explicit placeholder cards for secret achievements, and permanent immutability.
- [04: Hero Profile and Exportable Card UI Prototype](decisions/04-hero-card-ui-prototype.md) — Adopted Variant B (RPG Character Sheet & Quest Log) with split-column layout, Greek styling, and interactive Badge Showcase selector allowing users to pin up to 5 favorite achievements on the exportable PNG card. (Prototype: [prototypes/04-ui-dashboard/index.html?variant=B](../../prototypes/04-ui-dashboard/index.html?variant=B)).

## Not yet specified

- **Cloud Sync Strategy**: Multi-device synchronization protocol (CRDT vs CouchDB/Supabase) when syncing across devices in a future phase.
- **Sound & Micro-interactions**: Audio feedback, celebration confetti, and haptic feedback triggers upon quest completion or level up.
- **Pomodoro & Focus Intervals**: Break interval configuration, system notifications, and sound alerts for the focus timer.
- **Custom User Achievements**: Allowing users to create their own custom milestones and rules beyond system presets.

## Out of scope

- Multiplayer guilds, leaderboards, and competitive ranking (strictly personal single-player journey for MVP).
- Paid monetization, paywalls, or subscription models.
- Native mobile app store releases (PWA covers desktop and mobile without app store friction).
