# 06: Lossless JSON backup export/import and offline PWA packaging

**What to build:** The data sovereignty, backup/restore, and PWA packaging layer. Users can download a full backup of their entire database in a clean, human-readable JSON format at any time with a single click. Users can restore their data from a JSON backup file with conflict resolution modes (replace or merge). The app includes a complete PWA manifest and service worker configuration, enabling one-click installation on desktop and mobile home screens with 100% offline functionality.

**Blocked by:** 05: Featured badge showcase and exportable hero card generator

**Status:** ready-for-agent

- [ ] One-click database export implemented using `dexie-export-import`, producing a portable `.json` file containing all activities, time logs, quests, and achievements.
- [ ] Database import feature with validation and conflict options (`clearTablesBeforeImport: true` for full restore, `overwriteValues: true` for merge).
- [ ] PWA manifest (`manifest.json`) and service worker offline caching configured for standalone fullscreen launch on mobile and desktop.
- [ ] App icons and theme colors (`#070a12`, `#f59e0b`) registered for native-like look and feel.
- [ ] Automated round-trip tests verify that exporting, resetting the database, and importing restores 100% of data (hours, levels, quests, achievements) with zero loss.
