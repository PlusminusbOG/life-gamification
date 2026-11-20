# Spec: Life Gamification MVP

Status: resolved
Effort: life-gamification

## Problem Statement

People invest hundreds of hours into meaningful real-life pursuits (reading literature, fitness, studying languages, coding, creative arts), but traditional habit trackers and to-do apps fail to sustain long-term intrinsic motivation. Standard apps either treat habits as binary streaks that punish the user with guilt and total reset if a day is skipped, or behave as dry task lists where completed efforts vanish into an archive. Users have no persistent, cumulative record of their life's effort that they can feel proud of, no inspiring progression mechanics, and often fear losing their history if a cloud service changes its pricing or shuts down.

## Solution

A local-first, privacy-focused Progressive Web App (PWA) inspired by RPG progression mechanics and Greek mythology. The app converts logged hours and completed quests into permanent, non-degrading experience points (XP) and levels across user-defined Activities. Progress follows an empowering mathematical power curve with mythic Greek Pantheon tiers (*Mortal → Hero of Hellas → Demigod → Titan of Will → Olympian → Ascendant God*). Users manage actionable quests linked to activities, unlock permanent badges across 4 mythic categories (with hidden secret milestones), and can customize and export a high-resolution PNG Hero Card featuring their favorite accomplishments to share or archive. All data is stored in the browser via IndexedDB (Dexie.js), works 100% offline, and supports instant, lossless JSON backup/restoration.

## User Stories

1. As a user, I want to create custom Activities (e.g., "Reading Books", "Running", "Coding") with custom names, icons, and colors, so that I can track any life pursuit that matters to me.
2. As a user, I want to quickly log time spent on an activity post-factum (e.g., 30 minutes, 1.5 hours) with optional notes, so that I can record my efforts without friction.
3. As a user, I want an integrated stopwatch/timer that I can start and stop during a focus session, so that my active time is automatically measured and logged.
4. As a user, I want my total accumulated hours to strictly increase over time and never reset, decay, or decrease, so that my life's work is permanently preserved.
5. As a user, I want my hours to translate into RPG-style Levels using a power curve ($L = 1 + \lfloor h^{0.6} \times 3.0 \rfloor$), so that I receive fast positive reinforcement in the first 1–5 hours and meaningful prestige at 100–350+ hours.
6. As a user, I want my Activity and Hero level to correspond to Greek Pantheon Tiers (*Mortal, Hero of Hellas, Demigod, Titan of Will, Olympian, Ascendant God*), so that my growth feels epic and narratively rewarding.
7. As a user, I want each level to feature an evocative Greek mythological title (e.g., "Wanderer of Ithaca", "Argonaut", "Heir of Heracles", "Bearer of the Heavens", "Wisdom of Athena"), so that leveling up gives me a distinct identity milestone.
8. As a user, I want to see a clear progress bar indicating the exact minutes earned and remaining until the next level, so that I always know how close I am to advancing.
9. As a user, I want to create custom Quests with arbitrary titles and selectable XP rewards (+15m, +30m, +45m, +1h, +2h), so that I can break down my goals into actionable steps.
10. As a user, I want to optionally link a Quest to a specific Activity, so that completing the quest contributes bonus time/XP directly to that skill.
11. As a user, I want to organize Quests into "Today's Quests" and "Backlog", so that I can focus on daily priorities without clutter.
12. As a user, I want to mark a Quest as completed with a single tap, immediately triggering XP awards, level recalculations, and visual triumph feedback.
13. As a user, I want an Achievement Engine that automatically evaluates declarative predicates upon logging time or completing quests, so that I unlock badges as soon as criteria are met.
14. As a user, I want achievements categorized into 4 Greek mythological orders: *Gifts of Cronus* (total hours), *Labors of Heracles* (quest counts), *Ariadne's Thread* (consecutive active days), and *The Seven Muses* (multi-discipline versatility).
15. As a user, I want streak milestones (e.g., 3, 7, 30 days active) to reward consistency without any penalty or streak resets if a day is missed, so that I never feel guilty or burned out.
16. As a user, I want to browse a Temple of Achievements where standard badges display explicit progress bars (e.g., 7/10 quests completed), so that I know what milestones are within reach.
17. As a user, I want secret achievements to appear as placeholder mystery cards with lock icons, revealing their name and lore only upon discovery, so that exploration and surprise are rewarded.
18. As a user, I want once-unlocked achievements to remain permanently sealed in my database with their unlock timestamp, even if past logs or quests are edited or pruned.
19. As a user, I want an RPG Character Sheet layout (Variant B) displaying my avatar, current Greek tier, hero level, total lifetime hours, and quick actions in an intuitive split-screen desktop and stacked mobile view.
20. As a user, I want an interactive Badge Showcase selector in the export view where I can choose up to 5 favorite unlocked achievements to pin onto my Hero Card.
21. As a user, I want to export my customized Hero Card as a high-resolution PNG image with one click, so that I can share my accomplishments with friends or keep personal milestones.
22. As a user, I want all my data stored locally in my browser using IndexedDB (Dexie.js), so that the application loads instantly and functions completely offline without requiring any server.
23. As a user, I want to export my entire database into a single, clean JSON file at any time, so that I have complete ownership of my data and can back it up anywhere.
24. As a user, I want to import a JSON backup file with conflict resolution options (full replacement or merge), so that I can restore my data or move between devices without corruption.
25. As a user, I want to install the application as a Progressive Web App (PWA) on my desktop or mobile home screen, so that it launches in fullscreen like a native app.

## Implementation Decisions

### 1. Architectural Paradigm: Local-First PWA
The application is built as a single-page local-first web application using React, TypeScript, Tailwind CSS, Lucide icons, and Dexie.js (IndexedDB). No mandatory remote server or login wall is required.

### 2. Database Schema & Data Engine (Dexie.js v4+)
*From research ticket `02-dexie-schema-and-export.md`:*
- All persistent entities utilize client-generated string UUIDs (`crypto.randomUUID()`) declared as `id` to avoid key collisions during backup restoration or future multi-device synchronization.
- Non-indexable IndexedDB types (`boolean`, `null`, `undefined`) are avoided in index definitions. Enums are stored as strings (`'active' | 'completed' | 'archived'`), and timestamps are stored as numeric epoch milliseconds (`number`).
- High-frequency queries use compound indexes:
  - `timeLogs`: `'id, activityId, timestamp, [activityId+timestamp]'`
  - `quests`: `'id, activityId, status, dueDate, completedAt, [status+dueDate], [activityId+status]'`
  - `activities`: `'id, &name, createdAt, totalMinutes, level'`
  - `achievements`: `'id, &code, unlockedAt'`
  - `userProfile`: `'id'`
- Write-time denormalization: `activity.totalMinutes`, `activity.level`, and `userProfile.totalHours` are maintained inside atomic Dexie read-write transactions (`db.transaction('rw', ...)`) when logging time, delivering $O(1)$ dashboard reads.
- Data export/import is handled via `dexie-export-import` supporting chunked streaming into JSON blobs with both disaster recovery (replace) and merge modes.

### 3. Progression & Leveling Formula
*From prototype ticket `01-progression-formula.md`:*
- Progression is calculated via a pure, portable domain module (`GreekProgressionModule`):
  $$\text{Level} = 1 + \left\lfloor \left(\frac{\text{totalMinutes}}{60}\right)^{0.60} \times 3.0 \right\rfloor$$
- Hours required for level $L$:
  $$\text{Hours}(L) = \left(\frac{L - 1}{3.0}\right)^{1 / 0.60}$$
- Six Pantheon Tiers:
  - **Mortal** (Lvl 1–10, 0–8h): Wanderer of Ithaca, Athenian Citizen, Spartan Hoplite, Seeker of the Golden Fleece.
  - **Hero of Hellas** (Lvl 11–30, 8–45h): Argonaut, Spartan Warrior, Slayer of the Minotaur, Hero of Troy.
  - **Demigod** (Lvl 31–55, 45–125h): Chosen of the Oracle, Slayer of the Gorgon, Heir of Heracles.
  - **Titan of Will** (Lvl 56–80, 125–230h): Bearer of the Heavens (Atlas), Bringer of Fire (Prometheus), Master of Time (Chronos).
  - **Olympian** (Lvl 81–99, 230–350h): Guardian of Olympus, Messenger Hermes, Light of Apollo, Wisdom of Athena.
  - **Ascendant God** (Lvl 100+, 350+h): Ruler of Olympus (Zeus) / Immortal Pantheon.

### 4. Achievement Engine
*From grilling ticket `03-achievement-engine.md`:*
- Defined as pure declarative predicates:
  `type AchievementDef = { code: string; category: Category; predicate: (state: GameState) => boolean; progress: (state: GameState) => { current: number; max: number }; isSecret: boolean; }`
- Evaluated reactively in write transactions on every `TimeLog` and `Quest` completion.
- Four categories:
  1. *Gifts of Cronus* (10h Spartan Shield, 50h Spear of Achilles, 100h Laurel Wreath, 350h Zeus's Thunderbolt).
  2. *Labors of Heracles* (1st quest Nemean Lion, 10 quests Lernaean Hydra, 50 quests Girdle of Hippolyta, 100 quests Golden Apples of the Hesperides).
  3. *Ariadne's Thread* (3-day active streak, 7-day active streak, 30-day active streak; all permanent records).
  4. *The Seven Muses* (3 distinct activities reaching level 5+).
- Secret achievements are displayed in the catalog as locked mystery cards with hidden conditions until unlocked.

### 5. UI Layout & Hero Card Generator
*From prototype ticket `04-hero-card-ui-prototype.md`:*
- Layout follows **Variant B (RPG Character Sheet & Quest Log)**:
  - Left column: Avatar in gold frame, Pantheon Tier, Level, Title, XP bar, total hours, and PNG export trigger.
  - Right column: Tabbed parchment container for Daily Quests, Disciplines, and Achievements, with custom quest creator.
- Interactive Badge Showcase:
  - Users can select up to 5 unlocked badges to pin to the Hero Card.
  - Live real-time preview during selection.
  - Rendered to high-resolution PNG using HTML5 Canvas / `html-to-image` for instant download.

## Testing Decisions

### Seam Architecture
- The primary seam for automated verification is the **Domain Storage & Progression Service Facade** (`GameEngineService`):
  ```typescript
  interface GameEngineService {
    logTime(activityId: string, minutes: number, notes?: string, timestamp?: number): Promise<LogResult>;
    completeQuest(questId: string): Promise<QuestCompletionResult>;
    createQuest(input: CreateQuestInput): Promise<Quest>;
    createActivity(input: CreateActivityInput): Promise<Activity>;
    getHeroState(): Promise<HeroState>;
    exportDatabase(): Promise<Blob>;
    importDatabase(blob: Blob, mode: 'replace' | 'merge'): Promise<ImportResult>;
  }
  ```
- All unit and integration tests run against this single high-level seam with an in-memory IndexedDB mock (`fake-indexeddb`), asserting:
  - Mathematical correctness of level curves, XP carryover, and Pantheon title assignments.
  - Atomic denormalization of total hours across activities and user profile during concurrent writes.
  - Achievement predicate evaluations and unlock event emissions without duplicates or regression.
  - Full round-trip fidelity of JSON export and import.
- Pure UI components (Character Sheet, Quest Items, Badge Showcase Modal) are tested with lightweight interaction tests asserting prop-driven rendering.

## Out of Scope

- Multiplayer features, global leaderboards, friend feeds, or competitive leagues (strictly single-player personal journey).
- Backend servers, user authentication walls, cloud subscriptions, or payment gateways.
- Native mobile app store deployments (PWA installation covers desktop and mobile without app store friction).
- Audio synthesis and real-time physics particle engines (kept lightweight with CSS transitions and standard celebratory banners for MVP).

## Further Notes

- The project follows Matt Pocock's *Skills for Real Engineers* engineering system.
- Implementation will proceed through Tracer Bullet tickets generated via `/to-tickets`, each executed under strict TDD (`/tdd`) with red-green-refactor cycles.
- All domain terminology conforms to [GLOSSARY.md](file:///c:/Users/Адепт%20черной%20церкви/Desktop/для%20вайб%20кода/GLOSSARY.md).
