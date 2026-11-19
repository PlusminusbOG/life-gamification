# 03: Achievement Trigger and Evaluation Engine

Type: grilling
Status: resolved
Blocked by: 01, 02

## Question

How should achievements be represented, evaluated, and awarded?
- Are achievements declarative predicates evaluated reactively whenever a Time Log or Quest is saved, or event-driven triggers?
- What is the initial MVP taxonomy of achievements (e.g. Volume milestones like 10h/50h/100h, Consistency milestones like 3-day/7-day active days, Quest completion counts, Multi-discipline milestones)?

## Answer

Settled via Grilling interview session.

### Key Architectural Resolutions:
1. **Evaluation Engine**: Declarative pure predicates:
   Each achievement definition contains a predicate `(state: GameState) => boolean` and a progress function `(state: GameState) => { current: number, max: number }`.
   Evaluated reactively within the Dexie write transaction whenever a `TimeLog` or `Quest` is completed.
2. **Four Greek Mythological Categories**:
   - ⏳ **Дары Кроноса (Volume/Hours)**:
     - 10ч: «Спартанский щит»
     - 50ч: «Копье Ахилла»
     - 100ч: «Лавровый венок Олимпа»
     - 350ч: «Молния Зевса»
   - 🦁 **Подвиги Геракла (Quests completed)**:
     - 1-й квест: «Шкура Немейского льва»
     - 10 квестов: «Лернейская гидра»
     - 50 квестов: «Пояс Ипполиты»
     - 100 квестов: «Золотые яблоки Гесперид»
   - 🧵 **Нить Ариадны (Consistency/Active Days)**:
     - 3 дня активности подряд: «Первые шаги в лабиринте»
     - 7 дней подряд: «Нить Тесея»
     - 30 дней подряд: «Путеводитель Миноса» (рекорды постоянны, штрафов за пропуск нет).
   - 🎭 **Семь Муз (Polymath/Diversity)**:
     - Минимум 3 разные активности развиты до 5-го уровня и выше: «Гармония Муз».
3. **Visibility & Secret Achievements**:
   - Standard achievements display explicit progress bars (e.g., `7 / 10 квестов (70%)`).
   - Secret achievements are visibly displayed in the UI as placeholder cards with a mystery lock badge (e.g., `🔒 Скрытое достижение: Выполните тайное условие Олимпа`), unlocking into full view once achieved (e.g., «Ночное бдение Совы Афины» за работу глубокой ночью).
4. **Immutability Guarantee**:
   - Unlocked achievements record an immutable `unlockedAt: timestamp`. Subsequent editing or deletion of underlying logs or quests never revokes an unlocked badge.
