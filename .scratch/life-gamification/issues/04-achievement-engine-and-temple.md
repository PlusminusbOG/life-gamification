# 04: Declarative achievement engine and temple of achievements

**What to build:** The permanent achievement recognition engine. The app continuously evaluates declarative predicate functions over user state on every time log or quest completion within Dexie transactions. Users can browse the Temple of Achievements tab, viewing badges across 4 Greek mythological categories (*Gifts of Cronus*, *Labors of Heracles*, *Ariadne's Thread*, *The Seven Muses*). Standard badges show live progress bars (e.g., 7/10 quests), while secret achievements appear as mystery cards with lock icons until unlocked. Once earned, achievements are permanently stamped with `unlockedAt` and cannot be revoked or degraded.

**Blocked by:** 03: Custom quest creation, daily quest log, and focus stopwatch

**Status:** resolved

- [x] Dexie database schema updated with `achievements` table (`id, &code, unlockedAt`).
- [x] Declarative predicate evaluation engine implemented and triggered reactively on time log additions and quest completions.
- [x] Starter Greek achievements catalog populated across 4 categories:
  - Gifts of Cronus: 10h (Spartan Shield), 50h (Spear of Achilles), 100h (Laurel Wreath), 350h (Zeus's Thunderbolt).
  - Labors of Heracles: 1st quest (Nemean Lion), 10 quests (Lernaean Hydra), 50 quests (Girdle of Hippolyta), 100 quests (Golden Apples).
  - Ariadne's Thread: 3, 7, and 30 active days (records permanent, zero penalties for skipped days).
  - The Seven Muses: 3 distinct activities raised to level 5+.
- [x] Secret achievements (e.g. "Athena's Owl Night Vigil" for deep work after midnight) displayed as locked mystery cards with hidden conditions.
- [x] Unlocked achievements persist permanently with immutable `unlockedAt` timestamps.
- [x] Automated tests verify predicate evaluations, no duplicate unlocks, and immutable retention across state modifications.

## Answer

Implemented the Declarative Achievement Engine and Temple of Achievements (Ticket 04):
1. **Dexie Schema & Persistence (`src/domain/db.ts` & `src/domain/types.ts`)**:
   - Upgraded database schema to Version 3 including `achievements: 'id, &code, unlockedAt'` with unique `code` index.
   - Defined `Achievement`, `AchievementCategory`, and `AchievementWithDetails` domain models.
2. **Declarative Predicate Engine (`src/domain/achievementEngine.ts`)**:
   - Implemented starter catalog of 13 Greek mythological achievements across 4 categories plus secrets:
     - **Дары Кроноса** (10ч Спартанский щит, 50ч Копье Ахилла, 100ч Лавровый венок, 350ч Молния Зевса).
     - **Подвиги Геракла** (1 квест Немейский лев, 10 квестов Лернейская гидра, 50 квестов Пояс Ипполиты, 100 квестов Золотые яблоки).
     - **Нить Ариадны** (3, 7, 30 активных дней практики; строго накопительные, нулевые штрафы за пропущенные дни).
     - **Семь Муз** (3 занятия 5+ уровня «Гармония Муз»).
     - **Тайны Олимпа** («Ночная Сова Афины» за глубокую сессию между 00:00 и 05:00).
   - Ensured **immutable retention**: once `unlockedAt` is assigned, achievements are permanently stamped and cannot be revoked, expired, or degraded.
3. **Transaction Integration (`src/domain/gameEngineService.ts`)**:
   - `logTime` and `completeQuest` evaluate achievements automatically within atomic readwrite transactions.
   - Separate pure read-only method `getAchievements()` protects `useLiveQuery` from `ReadOnlyError` crashes while reflecting reactive changes instantly.
4. **Temple of Achievements UI (`src/components/TempleOfAchievements.tsx`)**:
   - Category filtering across all 5 groups with counter badges.
   - Live progress bars for locked badges showing current/max progress and percentages.
   - Locked secret achievements displayed as mystery cards with lock icons 🔒 and obscured conditions.
   - Unlocked badges highlighted with gold borders, glowing icons, and permanent unlock dates.
   - Seamless integration into `ParchmentQuestLog` tabs and `HeroCharacterSheet` counter link.
5. **Automated & Interactive Verification**:
   - 44 automated unit, integration, and SSR component tests passing (`vitest run`).
   - Clean TypeScript check (`tsc --noEmit`) and production build (`vite build`).
   - Browser agent verified error-free rendering, category filtering, and real-time unlock reactions.
