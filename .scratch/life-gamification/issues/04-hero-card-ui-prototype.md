# 04: Hero Profile and Exportable Card UI Prototype

Type: prototype
Status: resolved
Blocked by: 01

## Question

What is the visual layout, UX hierarchy, and design prototype for:
1. The main dashboard (Hero overview, total accumulated hours across life, active activities/skills).
2. The Quests view (Today vs Backlog).
3. The exportable Hero Card (PNG generation summarizing level, hours, badges for proud sharing)?

## Answer

Interactive UI prototype evaluated across 3 radically different layout variants. **Variant B (RPG Character Sheet & Quest Log)** was chosen as the winning design.

Interactive prototype source: [prototypes/04-ui-dashboard/index.html?variant=B](file:///c:/Users/Адепт%20черной%20церкви/Desktop/для%20вайб%20кода/prototypes/04-ui-dashboard/index.html?variant=B).

### Key Architectural & UX Resolutions:
1. **Layout Paradigm (Variant B: RPG Character Sheet)**:
   - **Left Column (Hero Sheet)**: Avatar in gilded Greek frame, Pantheon Tier (`ПОЛУБОГ ОЛИМПА`), Hero Level (48), Title (`Наследник Геракла`), XP bar, and total lifetime hours.
   - **Right Column (Quest & Activity Scroll)**: Tabbed parchment container (`⚔️ Квесты дня`, `📜 Все активности`, `🏆 Витрина Достижений`), task completion buttons, and custom quest creator.
2. **Featured Badge Showcase (Витрина Достижений)**:
   - Users can manually select up to 5 unlocked achievements to pin/feature on their Hero Card.
   - Live real-time preview of the card while toggling badges.
3. **Export Engine**:
   - Generates high-resolution PNG image of the customized Hero Card for social sharing or archiving without cloud dependencies.
