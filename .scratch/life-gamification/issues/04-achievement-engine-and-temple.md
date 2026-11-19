# 04: Declarative achievement engine and temple of achievements

**What to build:** The permanent achievement recognition engine. The app continuously evaluates declarative predicate functions over user state on every time log or quest completion within Dexie transactions. Users can browse the Temple of Achievements tab, viewing badges across 4 Greek mythological categories (*Gifts of Cronus*, *Labors of Heracles*, *Ariadne's Thread*, *The Seven Muses*). Standard badges show live progress bars (e.g., 7/10 quests), while secret achievements appear as mystery cards with lock icons until unlocked. Once earned, achievements are permanently stamped with `unlockedAt` and cannot be revoked or degraded.

**Blocked by:** 03: Custom quest creation, daily quest log, and focus stopwatch

**Status:** ready-for-agent

- [ ] Dexie database schema updated with `achievements` table (`id, &code, unlockedAt`).
- [ ] Declarative predicate evaluation engine implemented and triggered reactively on time log additions and quest completions.
- [ ] Starter Greek achievements catalog populated across 4 categories:
  - Gifts of Cronus: 10h (Spartan Shield), 50h (Spear of Achilles), 100h (Laurel Wreath), 350h (Zeus's Thunderbolt).
  - Labors of Heracles: 1st quest (Nemean Lion), 10 quests (Lernaean Hydra), 50 quests (Girdle of Hippolyta), 100 quests (Golden Apples).
  - Ariadne's Thread: 3, 7, and 30 active days (records permanent, zero penalties for skipped days).
  - The Seven Muses: 3 distinct activities raised to level 5+.
- [ ] Secret achievements (e.g. "Athena's Owl Night Vigil" for deep work after midnight) displayed as locked mystery cards with hidden conditions.
- [ ] Unlocked achievements persist permanently with immutable `unlockedAt` timestamps.
- [ ] Automated tests verify predicate evaluations, no duplicate unlocks, and immutable retention across state modifications.
