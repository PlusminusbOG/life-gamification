# 02: Greek pantheon progression engine and hero character sheet

**What to build:** The RPG leveling and Greek mythology progression layer. When the user logs time in any Activity, the app computes experience points and assigns an Activity Level and overall Hero Level based on the high-density power curve ($L = 1 + \lfloor h^{0.6} \times 3.0 \rfloor$). The user sees the Variant B Hero Character Sheet: an avatar in a gilded Greek frame, current Pantheon Tier (*Mortal, Hero of Hellas, Demigod, Titan of Will, Olympian, Ascendant God*), evocative Greek mythological title (e.g. "Argonaut", "Heir of Heracles"), and an animated progress bar indicating exact minutes earned and remaining until the next level.

**Blocked by:** 01: Project scaffolding, local database, and manual activity time logging

**Status:** resolved

- [x] Pure `GreekProgressionModule` implemented according to validated prototype formula: $\text{Level} = 1 + \lfloor (\text{totalMinutes} / 60)^{0.60} \times 3.0 \rfloor$.
- [x] Greek Pantheon tiers and mythological titles accurately map across levels 1 through 100+:
  - Mortal (1–10: Wanderer of Ithaca, Spartan Hoplite, Seeker of the Golden Fleece)
  - Hero of Hellas (11–30: Argonaut, Spartan Warrior, Slayer of the Minotaur, Hero of Troy)
  - Demigod (31–55: Chosen of the Oracle, Slayer of the Gorgon, Heir of Heracles)
  - Titan of Will (56–80: Bearer of the Heavens, Bringer of Fire, Master of Time)
  - Olympian (81–99: Guardian of Olympus, Messenger Hermes, Light of Apollo, Wisdom of Athena)
  - Ascendant God (100+: Ruler of Olympus / Zeus)
- [x] Variant B Hero Character Sheet UI component displays avatar, Pantheon Tier, Level, Title, and total lifetime hours.
- [x] XP Progress Bar accurately shows percentage progress, minutes earned in current level, and minutes remaining to next level.
- [x] Automated tests verify mathematical curve boundaries, early level speed (Level 2 at ~20 min, Level 12 at 10h), and smooth tier transitions.

## Answer

Implemented the Greek Pantheon Progression Engine and Variant B Hero Character Sheet:
1. **Mathematical Engine (`GreekProgressionModule` in `src/domain/progression.ts`)**:
   - Implemented exact formula $\text{Level} = 1 + \lfloor (\text{totalMinutes} / 60)^{0.60} \times 3.0 \rfloor$.
   - Added inverse threshold functions (`calculateHoursForLevel`, `calculateMinutesForLevel`) to calculate exact integer minute thresholds for level-ups.
   - Enhanced `getLevelProgress` to return exact minutes earned in current level, minutes remaining until next level, and percentage progress.
2. **Greek Pantheon Tiers & Mythological Titles**:
   - Full mapping across all 6 tiers: Mortal, Hero of Hellas, Demigod, Titan of Will, Olympian, Ascendant God.
   - Granular sub-level mythological titles in Russian and English (e.g. Странник Итаки, Спартанский Гоплит, Искатель Золотого Руна; Аргонавт, Спартанский Воитель, Победитель Минотавра, Герой Трои; Избранник Оракула, Победитель Горгоны, Наследник Геракла; Держатель Небосвода, Дарующий Огонь, Владыка Времени; Страж Олимпа, Вестник Гермес, Свет Аполлона, Мудрость Афины; Владыка Олимпа / Зевс).
3. **UI Components (`HeroCharacterSheet` & `XPProgressBar`)**:
   - `XPProgressBar`: Animated gold gradient progress bar showing percentage, minutes earned in current level, minutes remaining to next level, and upcoming title.
   - `HeroCharacterSheet`: Variant B RPG character sheet with gilded Greek frame, dynamic avatar with tier-based glow/emblem, current Pantheon Tier, hero name, mythological title, hero level badge, lifetime hours, and activity statistics.
   - Responsive two-column layout in `App.tsx` (sticky Character Sheet on desktop, stacked on mobile).
4. **Verification**:
   - Comprehensive test suite covering curve boundaries (Level 2 at 20m, Level 12 at 10h, Level 101 at 350h), inverse minute thresholds, smooth tier transitions, and SSR component rendering.
   - 22 automated tests passing cleanly. Production build and typecheck verified.
