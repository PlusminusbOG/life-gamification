# 01: Progression and XP Leveling Curve

Type: prototype
Status: resolved
Blocked by: none

## Question

What exact mathematical formula converts accumulated hours and completed quests into Activity/Skill levels and XP? 
How do we balance early-game feedback (rapid level-ups in the first 1-10 hours to build momentum) against long-term mastery (100–1000+ hours) so the user feels persistent pride without hitting an infinite grind wall?

## Answer

Interactive logic prototype built and validated at [prototypes/01-progression-formula/index.html](file:///c:/Users/Адепт%20черной%20церкви/Desktop/для%20вайб%20кода/prototypes/01-progression-formula/index.html).

### Key Architectural Resolutions:
1. **Mathematical Power Curve**: Adopted high-density power curve:
   $$\text{Level} = 1 + \lfloor (\text{totalMinutes} / 60)^{0.60} \times 3.0 \rfloor$$
   - Early momentum: Level 2 reached at ~20 minutes. Level 12 reached at 10 hours.
   - Long-term scaling: Level 48 at 100 hours, Level 100 at 350 hours, Level 126 at 500 hours.
   - Pure logic engine module isolated in prototype (`GreekProgressionModule`).
2. **Greek Mythology Pantheon Tiers**:
   - **Mortal (Ур. 1–10)**: Странник Итаки → Афинский гражданин → Спартанский гоплит → Искатель Золотого Руна.
   - **Hero (Ур. 11–30)**: Аргонавт → Спартанский воитель → Победитель Минотавра → Герой Трои (Ахилл).
   - **Demigod (Ур. 31–55)**: Избранник Оракула → Победитель Горгоны (Персей) → Наследник Геракла.
   - **Titan (Ур. 56–80)**: Держатель Небосвода (Атлант) → Дарующий Огонь (Прометей) → Владыка Времени (Хронос).
   - **Olympian (Ур. 81–99)**: Страж Олимпа → Вестник Гермес → Бог Аполлон → Богиня Афина.
   - **Ascendant God (Ур. 100+)**: Владыка Олимпа (Зевс) / Пантеон Бессмертных.
3. **Custom Quests**:
   - Users can create custom quests with arbitrary titles and selectable XP rewards (+15m, +30m, +45m, +1h, +2h).
   - Completing a quest immediately feeds into the progression engine, awarding XP minutes and triggering level/rank recalculations.
