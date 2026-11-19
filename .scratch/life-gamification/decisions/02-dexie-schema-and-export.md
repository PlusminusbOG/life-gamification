# 02: Dexie.js Schema and JSON Serialization

Type: research
Status: resolved
Blocked by: none

## Question

What is the optimal Dexie.js (IndexedDB) schema for Activities, Time Logs, Quests, Achievements, and User Profile?
Specifically:
- What indexes are required for instant queries of totals and date ranges?
- How should the JSON import/export format and schema migrations be structured to guarantee that user data can never be corrupted, lost, or trapped across updates?

## Answer

Comprehensive technical research conducted against primary sources (Dexie.js v4+ documentation, W3C IndexedDB 3.0 specification, and `dexie-export-import`). Full report documented in [docs/research/02-dexie-schema-and-export.md](file:///c:/Users/Адепт%20черной%20церкви/Desktop/для%20вайб%20кода/docs/research/02-dexie-schema-and-export.md).

### Key Architectural Resolutions:
1. **Primary Key Strategy**: Inbound string UUIDs (`crypto.randomUUID()`) for all persistent entities (`activities`, `timeLogs`, `quests`, `achievements`, `userProfile`, `skills`). Auto-increment IDs (`++id`) are rejected to avoid key collisions on multi-device import and synchronization.
2. **IndexedDB Type Safety**: Booleans, nulls, and undefined cannot be indexed in IndexedDB. Quests use string enums (`'active' | 'completed' | 'archived'`). Timestamps are stored as epoch milliseconds (`number`) for numeric range querying and JSON portability.
3. **Compound Indexes**:
   - `timeLogs`: `'id, activityId, timestamp, [activityId+timestamp]'` (enables instant weekly time range and per-activity range queries).
   - `quests`: `'id, activityId, status, dueDate, completedAt, [status+dueDate], [activityId+status]'` (enables instant "Due Today" and "Backlog" lookups).
   - `activities`: `'id, &name, createdAt, totalMinutes, level'`.
   - `achievements`: `'id, &code, unlockedAt'`.
   - `userProfile`: `'id'`.
4. **Denormalization**: Real-time totals (`totalMinutes`, `level`, and hero `totalHours`) are denormalized and maintained inside atomic Dexie transactions (`db.transaction('rw', ...)`) during time log creation, providing $O(1)$ dashboard reads.
5. **Data Backup & Integrity**: 
   - Primary: `dexie-export-import` (`exportDB` / `importInto`) with configurable conflict modes (`clearTablesBeforeImport: true` for full restoration; `overwriteValues: true` for upsert/merge).
   - Secondary: Portable typed JSON format (`LifeGamificationPortableV1`) with runtime schema validation.
   - Migrations follow Dexie's append-only `db.version(n).stores({...}).upgrade(trans => ...)` transactional contract.
