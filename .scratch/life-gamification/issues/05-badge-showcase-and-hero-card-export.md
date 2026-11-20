# 05: Featured badge showcase and exportable hero card generator

**What to build:** The social pride and milestone export feature. A user can open the "Export Hero Card" modal, view their unlocked achievements, and manually select up to 5 favorite badges to showcase on their personalized Hero Card. The preview updates in real time, rendering an epic card in the Greek Pantheon color palette featuring their name, Greek tier, level, total lifetime hours, primary activity, and pinned badge icons. Clicking "Download Image" generates and downloads a high-resolution 1200x630 Retina PNG image for sharing or archiving.

**Blocked by:** 04: Declarative achievement engine and temple of achievements

**Status:** resolved

- [x] Interactive Badge Showcase modal allows selecting up to 5 unlocked achievements to pin to the card.
- [x] UI enforces maximum 5 badge selection limit with user feedback.
- [x] Real-time card preview updates dynamically as badges are checked or unchecked.
- [x] High-resolution PNG image generation (1200x630 Retina) implemented via HTML5 Canvas / `html-to-image`.
- [x] One-click download button triggers instant image file download named `hero-card-<timestamp>.png`.
- [x] Automated tests verify badge selection capping (max 5) and correct rendering payload generation.

## Реализация

Реализована витрина избранных регалий и генератор экспортных карточек героя (Тикет 05):

1. **Доменный модуль экспорта (`src/domain/heroCardExport.ts`)**:
   - `buildHeroCardPayload`: чистая сборка и валидация данных карточки героя (имя, ступень пантеона, мифологический титул, RPG-уровень, несгораемые часы, главное занятие, избранные регалии).
   - `getPrimaryActivity`: вычисление главного занятия героя по максимальному времени практики.
   - `togglePinnedBadge`: чистая логика включения/исключения регалий с жестким ограничением максимум в 5 штук и возвратом ошибки при превышении лимита.
   - `renderHeroCardToCanvas`: отрисовка карточки высокого разрешения 1200x630 Retina на HTML5 Canvas в эпической греческой палитре (обсидиановый градиент, золотая кайма, меандр, аватар, статы, витрина 5 регалий и греческий афоризм).
   - `downloadCanvasAsPng` и `generateHeroCardFilename`: генерация и скачивание файла `hero-card-<timestamp>.png`.

2. **Сохранение в IndexedDB (`src/domain/types.ts` и `src/domain/gameEngineService.ts`)**:
   - Расширена модель `UserProfile` полем `pinnedBadgeCodes?: string[]`.
   - В `GameEngineService` добавлены методы `updatePinnedBadges` и `getPinnedBadges` с автоматическим сохранением выбора пользователя.

3. **Компоненты интерфейса (`src/components/`)**:
   - `HeroCardPreview.tsx`: интерактивный предпросмотр карточки с адаптивным оформлением под ступени пантеона (Смертный, Герой, Полубог, Титан, Олимпиец, Бог), отображением главного занятия и 5 слотов регалий.
   - `ExportHeroCardModal.tsx`: модальное окно с выбором до 5 регалий из числа открытых в Храме, счетчиком «Выбрано: X из 5», предупреждением при превышении лимита, живым превью и кнопкой «Скачать карточку (1200x630 PNG)».
   - `HeroCharacterSheet.tsx`: добавлена золотая кнопка «Экспорт карточки героя».

4. **Тестирование и проверка**:
   - 62 автоматических теста (`vitest run`) успешно пройдены (12 тестов для `heroCardExport`, 4 теста для `ExportHeroCardModal`, 15 тестов `gameEngineService` и др.).
   - Успешная сборка TypeScript (`tsc --noEmit`) и продакшн-билд (`vite build`).
   - Браузерный агент проверил весь сценарий на `http://localhost:5174/` (открытие модалки, выбор/снятие регалий, живое обновление карточки, скачивание PNG с таймстемпом).
   - Независимые ревью subagents: **Standards Review: PASS**, **Spec Review: PASS**.
