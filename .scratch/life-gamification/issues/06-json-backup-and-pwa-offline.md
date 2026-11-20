# 06: Lossless JSON backup export/import and offline PWA packaging

**What to build:** The data sovereignty, backup/restore, and PWA packaging layer. Users can download a full backup of their entire database in a clean, human-readable JSON format at any time with a single click. Users can restore their data from a JSON backup file with conflict resolution modes (replace or merge). The app includes a complete PWA manifest and service worker configuration, enabling one-click installation on desktop and mobile home screens with 100% offline functionality.

**Blocked by:** 05: Featured badge showcase and exportable hero card generator

**Status:** resolved

- [x] One-click database export implemented using `dexie-export-import`, producing a portable `.json` file containing all activities, time logs, quests, and achievements.
- [x] Database import feature with validation and conflict options (`clearTablesBeforeImport: true` for full restore, `overwriteValues: true` for merge).
- [x] PWA manifest (`manifest.json`) and service worker offline caching configured for standalone fullscreen launch on mobile and desktop.
- [x] App icons and theme colors (`#070a12`, `#f59e0b`) registered for native-like look and feel.
- [x] Automated round-trip tests verify that exporting, resetting the database, and importing restores 100% of data (hours, levels, quests, achievements) with zero loss.

## Реализация

Реализован слой суверенитета данных, резервного копирования и автономной PWA-упаковки (Тикет 06):

1. **Сервис резервного копирования (`src/domain/backupService.ts`)**:
   - `exportDatabaseBackup`: создание полного дампа базы данных в переносимый JSON-файл через библиотеку `dexie-export-import`.
   - `validateBackupBlob`: предварительная инспекция структуры и подсчет количества строк и таблиц перед импортом.
   - `importDatabaseBackup`: восстановление базы данных с двумя стратегиями разрешения конфликтов:
     - `replace`: полная очистка текущей базы (`clearTablesBeforeImport: true`) и точное развертывание данных из файла.
     - `merge`: слияние записей (`clearTablesBeforeImport: false, overwriteValues: true`) без потери уникальных существующих данных.
   - `downloadBackupBlob` и `generateBackupFilename`: сохранение файла `life-gamification-backup-<timestamp>.json`.

2. **Модальное окно бекапа и восстановления (`src/components/BackupModal.tsx`)**:
   - Экспорт в один клик с мгновенным сохранением JSON-файла.
   - Загрузка файла резервной копии с валидацией, предпросмотром количества записей по таблицам и переключателем режима восстановления (`replace` / `merge`).
   - Кнопка вызова модального окна интегрирована в шапку (`Header.tsx`) и подвал (`App.tsx`).

3. **PWA-манифест и Service Worker (`public/`, `index.html`, `src/main.tsx`)**:
   - Манифест `manifest.webmanifest` и `manifest.json` с настройками standalone-режима, метаданными и фирменной темой пантеона (`#070a12`, `#f59e0b`).
   - SVG-иконки 192x192 и 512x512 со спартанским щитом и символикой Олимпа.
   - Офлайн Service Worker (`public/sw.js`) со стратегиями network-first с fallback для навигации и cache-first для статических ресурсов (100% работоспособность без интернета).
   - Автоматическая регистрация сервис-воркера в `src/main.tsx`.

4. **Тестирование и проверка качества**:
   - Добавлены сквозные round-trip тесты в `backupService.test.ts`, подтверждающие 100% восстановление всех сущностей без потерь, проверку режима слияния и валидацию поврежденных файлов.
   - Добавлены компонентные тесты в `BackupModal.test.tsx`.
   - Все **70 тестов** успешно пройдены (`vitest run`).
   - Чистая компиляция TypeScript (`tsc --noEmit`) и сборка продакшн-бандла (`vite build`).
   - Браузерный субагент проверил интерфейс, открытие модального окна, экспорт бекапа и загрузку PWA-манифеста в реальном браузере.
   - Независимые проверки: **Standards Review: PASS**, **Spec Review: PASS**.
