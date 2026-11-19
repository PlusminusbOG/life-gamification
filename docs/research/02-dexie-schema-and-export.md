# Research: Dexie.js v4+ Schema Design, Query Indexing, and JSON Serialization

**Ticket Reference**: [02-dexie-schema-and-export.md](file:///c:/Users/Адепт%20черной%20церкви/Desktop/для%20вайб%20кода/.scratch/life-gamification/issues/02-dexie-schema-and-export.md)  
**Author**: Researcher Subagent  
**Date**: November 2026  
**Standards & References**:
- [Dexie.js Official Documentation (dexie.org)](https://dexie.org/docs/)
- [Dexie.js TypeScript Guide](https://dexie.org/docs/Typescript)
- [Dexie.js EntityTable Type API](https://dexie.org/docs/EntityTable)
- [Dexie.js Compound Indexes](https://dexie.org/docs/Compound-Index)
- [Dexie.js Version.stores() Syntax](https://dexie.org/docs/Version/Version.stores())
- [Dexie.js Version.upgrade() Migrations](https://dexie.org/docs/Version/Version.upgrade())
- [Dexie Export-Import Documentation](https://dexie.org/docs/ExportImport/dexie-export-import)
- [W3C IndexedDB 3.0 Specification: Section 3.1.3 (Key Valid Types)](https://www.w3.org/TR/IndexedDB-3/#key-construct)

---

## Executive Summary

For an offline-first, local-first gamification system, the optimal Dexie.js v4 schema uses client-generated string UUIDs (`crypto.randomUUID()`) as primary keys across all tables, avoiding auto-increment ID collisions during backups, multi-device imports, and future synchronization. High-frequency queries (weekly time log ranges and today's due quests) are optimized through compound indexes (`[activityId+timestamp]` and `[status+dueDate]`), while booleans are strictly avoided in indexes because IndexedDB cannot index boolean, null, or undefined values. Full data integrity, disaster recovery, and lossless export/import are best achieved using `dexie-export-import` with configurable conflict strategies (`clearTablesBeforeImport` for full restoration vs `overwriteValues` for upserting), supplemented by atomic Dexie write transactions (`db.transaction('rw', ...)`) that maintain denormalized totals (`totalMinutes`, `level`, `totalHours`) in real-time.

---

## Evidence & Findings

### 1. Optimal Dexie v4+ Table Schema & Index Definitions

#### 1.1 Primary Key Strategy: UUID vs Auto-increment
- **Primary Source**: [Dexie.js Schema Syntax](https://dexie.org/docs/Version/Version.stores()), [W3C IndexedDB 3.0 Key Path](https://www.w3.org/TR/IndexedDB-3/#key-construct).
- **Finding**: While Dexie provides `++id` for auto-incrementing integer keys, auto-incrementing IDs pose severe hazards for local-first applications. When user data is exported and later imported or merged across devices, integer sequences inevitably collide (`id: 1` on device A overwrites `id: 1` on device B).
- **Rule**: All persistent entities must use inbound string UUIDs (`id: string`) generated via standard Web API `crypto.randomUUID()`. In Dexie's `version.stores()`, this is declared simply as `id` (without `++`).

#### 1.2 IndexedDB Key Constraints
- **Primary Source**: [W3C IndexedDB 3.0 Section 3.1.3 (Keys)](https://www.w3.org/TR/IndexedDB-3/#key-construct) and [Dexie What Can Be Indexed](https://dexie.org/docs/Version/Version.stores()#syntax-rules).
- **Finding**: IndexedDB can **only** index `DOMString`, `number` (excluding `NaN`), `Date` (valid timestamps), `ArrayBuffer`, and `Array` of valid keys.
- **Critical Edge Cases**:
  - `boolean` (`true` / `false`), `null`, `undefined`, and standard plain objects **CANNOT** be indexed.
  - Declaring a boolean index (e.g., `isCompleted`) fails silently or throws errors in IndexedDB queries.
  - **Resolution**: Quests must use string status enums (`'active' | 'completed' | 'archived'`).
  - Timestamps must be stored and indexed as epoch milliseconds (`number`, e.g., `Date.now()`), which serialize directly to JSON without timezone ambiguity and support fast numeric range indexing.

#### 1.3 Schema Minimality Rule
- **Primary Source**: [Dexie.js Version.stores() Docs](https://dexie.org/docs/Version/Version.stores()).
- **Finding**: Unlike SQL databases, Dexie's schema declaration **only defines indexed properties**. All other entity properties (descriptions, notes, UI themes, metadata, progress fractions) are stored losslessly inside the object store without declaring them in `stores()`. Indexing unqueried properties degrades write performance and bloats IndexedDB b-tree indices.

#### 1.4 Dexie v4 TypeScript Entity Definitions

Dexie v4 introduces `EntityTable<T, 'id'>` which provides typed table access and extracts the primary key type cleanly.

```typescript
import Dexie, { type EntityTable } from 'dexie';

// --- Ubiquitous Domain Models (GLOSSARY.md compliant) ---

export interface Activity {
  id: string;              // UUID
  name: string;            // Unique name (e.g., "Coding", "Reading")
  totalMinutes: number;    // Denormalized running sum (cumulative, never decreases)
  level: number;           // Derived RPG level
  skillId?: string;        // Optional link to Skill
  icon?: string;
  color?: string;
  createdAt: number;       // Epoch ms
  updatedAt: number;       // Epoch ms
}

export interface TimeLog {
  id: string;              // UUID
  activityId: string;      // Foreign key -> Activity.id
  durationMinutes: number; // Session length
  timestamp: number;       // Epoch ms when session completed
  notes?: string;          // Session reflections
  createdAt: number;       // Epoch ms
}

export type QuestStatus = 'active' | 'completed' | 'archived';

export interface Quest {
  id: string;              // UUID
  title: string;
  activityId?: string;     // Optional link to Activity
  status: QuestStatus;     // String enum (indexable)
  dueDate?: number | null; // Epoch ms (or null if unscheduled)
  completedAt?: number | null; // Epoch ms
  priority?: number;       // 1 = High, 2 = Medium, 3 = Low
  createdAt: number;       // Epoch ms
}

export interface Achievement {
  id: string;              // UUID
  code: string;            // Unique system code (e.g., 'VOLUME_10H', 'FIRST_LOG')
  unlockedAt: number | null; // Epoch ms (null if locked)
  progress: number;        // Current progress value
  maxProgress: number;     // Target milestone value
  updatedAt: number;       // Epoch ms
}

export interface UserProfile {
  id: string;              // Singleton key: 'me'
  name: string;
  totalHours: number;      // Denormalized all-time hero hours
  settings: {
    theme?: 'light' | 'dark' | 'system';
    soundEnabled?: boolean;
    confettiEnabled?: boolean;
    weekStartsOn?: 0 | 1;   // Sunday = 0, Monday = 1
  };
  createdAt: number;
  updatedAt: number;
}

// Optional 6th table aligning with GLOSSARY.md Skill definition
export interface Skill {
  id: string;              // UUID
  name: string;            // e.g., "Intellect", "Endurance"
  description?: string;
  createdAt: number;
}
```

#### 1.5 Database Class & Stores Declaration

```typescript
export class LifeGamificationDB extends Dexie {
  activities!: EntityTable<Activity, 'id'>;
  timeLogs!: EntityTable<TimeLog, 'id'>;
  quests!: EntityTable<Quest, 'id'>;
  achievements!: EntityTable<Achievement, 'id'>;
  userProfile!: EntityTable<UserProfile, 'id'>;
  skills!: EntityTable<Skill, 'id'>;

  constructor(databaseName = 'LifeGamificationDB') {
    super(databaseName);

    this.version(1).stores({
      // Table: PrimaryKey, Index1, Index2, [Compound+Index]
      activities: 'id, &name, createdAt, totalMinutes, level',
      timeLogs: 'id, activityId, timestamp, [activityId+timestamp]',
      quests: 'id, activityId, status, dueDate, completedAt, [status+dueDate], [activityId+status]',
      achievements: 'id, &code, unlockedAt',
      userProfile: 'id',
      skills: 'id, &name'
    });
  }
}

export const db = new LifeGamificationDB();
```

---

### 2. Fast Query Patterns and Compound Indexing

- **Primary Sources**:
  - [Dexie.js Compound Index Guide](https://dexie.org/docs/Compound-Index)
  - [Dexie.js WhereClause.between()](https://dexie.org/docs/WhereClause/WhereClause.between())
  - [Dexie.js Collection.each()](https://dexie.org/docs/Collection/Collection.each())

#### 2.1 Range Query: Time Logs This Week
To query all logs logged across all activities between `startOfWeekMs` and `endOfWeekMs`:
```typescript
export async function getTimeLogsInDateRange(
  db: LifeGamificationDB,
  startMs: number,
  endMs: number
): Promise<TimeLog[]> {
  // between(lowerBound, upperBound, includeLower = true, includeUpper = true)
  return await db.timeLogs
    .where('timestamp')
    .between(startMs, endMs, true, true)
    .toArray();
}
```

#### 2.2 Activity-Scoped Range Query: Compound Index `[activityId+timestamp]`
When viewing an Activity's progress page or calculating weekly totals for a specific pursuit, using the compound index avoids loading unrelated logs into memory:
```typescript
export async function getActivityLogsInDateRange(
  db: LifeGamificationDB,
  activityId: string,
  startMs: number,
  endMs: number
): Promise<TimeLog[]> {
  // Compound index query matches activityId exactly and filters timestamp range
  return await db.timeLogs
    .where('[activityId+timestamp]')
    .between([activityId, startMs], [activityId, endMs], true, true)
    .toArray();
}
```

#### 2.3 Quests Due Today & Overdue: Compound Index `[status+dueDate]`
To list active quests that must be displayed in the "Today" panel:
```typescript
export async function getActiveQuestsDueBy(
  db: LifeGamificationDB,
  dueBeforeMs: number
): Promise<Quest[]> {
  // Queries active quests with dueDate <= dueBeforeMs (excluding unscheduled)
  return await db.quests
    .where('[status+dueDate]')
    .between(['active', 0], ['active', dueBeforeMs], true, true)
    .toArray();
}

export async function getActiveBacklogQuests(
  db: LifeGamificationDB
): Promise<Quest[]> {
  // Queries active quests, filtering unscheduled in-memory or where dueDate == null
  return await db.quests
    .where('status')
    .equals('active')
    .filter(q => q.dueDate === null || q.dueDate === undefined || q.dueDate === 0)
    .toArray();
}
```

#### 2.4 Aggregation Strategy: Write-time Denormalization vs On-Demand Recalculation
- **Tradeoff Analysis**:
  - *On-Demand Summing*: Calculating total hours by running `timeLogs.where('activityId').equals(id).toArray().reduce(...)` becomes an $O(N)$ table scan that slows down as the database grows to thousands of records.
  - *Write-time Denormalization*: Updating `activity.totalMinutes` and `userProfile.totalHours` atomically inside a transaction during time log insertion ensures dashboard queries are instant $O(1)$ lookups.
- **Dexie Implementation**:
```typescript
export async function recordTimeLogAtomic(
  db: LifeGamificationDB,
  log: Omit<TimeLog, 'id' | 'createdAt'>,
  computeLevel: (totalMinutes: number) => number
): Promise<TimeLog> {
  const newLog: TimeLog = {
    ...log,
    id: crypto.randomUUID(),
    createdAt: Date.now()
  };

  await db.transaction('rw', [db.timeLogs, db.activities, db.userProfile], async () => {
    // 1. Insert the log
    await db.timeLogs.add(newLog);

    // 2. Denormalize on Activity
    const activity = await db.activities.get(newLog.activityId);
    if (activity) {
      const updatedTotal = activity.totalMinutes + newLog.durationMinutes;
      const updatedLevel = computeLevel(updatedTotal);
      await db.activities.update(activity.id, {
        totalMinutes: updatedTotal,
        level: updatedLevel,
        updatedAt: Date.now()
      });
    }

    // 3. Denormalize on UserProfile
    const profile = await db.userProfile.get('me');
    if (profile) {
      const additionalHours = +(newLog.durationMinutes / 60).toFixed(2);
      await db.userProfile.update('me', {
        totalHours: +(profile.totalHours + additionalHours).toFixed(2),
        updatedAt: Date.now()
      });
    }
  });

  return newLog;
}
```

---

### 3. Data Integrity, Backup/Restore, and Migrations

#### 3.1 `dexie-export-import` Architecture
- **Primary Source**: [Dexie Export-Import Documentation](https://dexie.org/docs/ExportImport/dexie-export-import), [npm dexie-export-import](https://www.npmjs.com/package/dexie-export-import).
- **Core Capabilities**:
  - Encapsulates database tables, schemas, row counts, and binary records into a single standardized JSON-based `Blob`.
  - Employs chunked streaming (`chunkSizeBytes`, `numRowsPerChunk`) to export and import large databases without exhausting browser memory or blocking UI threads.
  - Supports non-destructive inspecting via `peakImportFile(blob)`.

#### 3.2 Backup Export Function
```typescript
import { exportDB } from 'dexie-export-import';

export async function exportDatabaseBackup(
  db: LifeGamificationDB,
  onProgress?: (completedRows: number, totalRows: number) => void
): Promise<Blob> {
  return await exportDB(db, {
    prettyJson: true,
    numRowsPerChunk: 500,
    progressCallback: progress => {
      if (onProgress && progress.totalRows) {
        onProgress(progress.completedRows, progress.totalRows);
      }
      return true; // continue export
    }
  });
}
```

#### 3.3 Conflict Resolution Strategies for Import
`dexie-export-import` provides explicit flags in `ImportOptions` allowing three distinct user workflows:

| Mode | Options | Behavior | Use Case |
| :--- | :--- | :--- | :--- |
| **Full Restore (Wipe & Replace)** | `clearTablesBeforeImport: true` | Clears all existing local records, then writes imported data. | Restoring a backup on a new device or wiping corrupted local state. |
| **Merge / Upsert** | `overwriteValues: true`, `clearTablesBeforeImport: false` | Keeps existing records; if a record with the same `id` UUID exists, it updates it. | Merging data from an offline session into an existing installation. |
| **Safe Merge (Skip / Disallow Conflicts)** | `overwriteValues: false`, `clearTablesBeforeImport: false` | Rejects records that collide with existing keys (throws `ConstraintError`). | Strict duplicate prevention. |

```typescript
import { importInto, peakImportFile } from 'dexie-export-import';

export interface ImportBackupOptions {
  mode: 'replace' | 'merge';
  onProgress?: (completedRows: number, totalRows: number) => void;
}

export async function importDatabaseBackup(
  db: LifeGamificationDB,
  backupBlob: Blob,
  options: ImportBackupOptions
): Promise<{ databaseName: string; totalImportedRows: number }> {
  // 1. Inspect metadata safely before mutating database
  const metadata = await peakImportFile(backupBlob);
  const totalRows = metadata.data.tables.reduce((sum, t) => sum + t.rowCount, 0);

  // 2. Execute import with selected conflict policy
  await importInto(db, backupBlob, {
    clearTablesBeforeImport: options.mode === 'replace',
    overwriteValues: options.mode === 'merge',
    acceptMissingTables: true,
    acceptVersionDiff: true,
    progressCallback: progress => {
      if (options.onProgress && progress.totalRows) {
        options.onProgress(progress.completedRows, progress.totalRows);
      }
      return true;
    }
  });

  return {
    databaseName: metadata.data.databaseName,
    totalImportedRows: totalRows
  };
}
```

#### 3.4 Decoupled JSON Format: Two-Tier Backup Architecture
While `dexie-export-import` is the gold standard for full database clone and restore, a local-first application should also offer a human-readable, portable JSON format (`LifeGamificationPortableV1`):

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-11-20T00:00:00.000Z",
  "appVersion": "1.0.0",
  "data": {
    "userProfile": { "id": "me", "name": "Hero", "totalHours": 142.5, "settings": {} },
    "activities": [
      { "id": "uuid-1", "name": "Coding", "totalMinutes": 4500, "level": 12, "createdAt": 1700000000000 }
    ],
    "timeLogs": [
      { "id": "uuid-log-1", "activityId": "uuid-1", "durationMinutes": 60, "timestamp": 1700003600000 }
    ],
    "quests": [
      { "id": "uuid-q-1", "title": "Implement Dexie Schema", "status": "active", "dueDate": 1700090000000 }
    ],
    "achievements": [
      { "id": "uuid-a-1", "code": "FIRST_LOG", "unlockedAt": 1700003600000, "progress": 1, "maxProgress": 1 }
    ]
  }
}
```
*Benefits*: Platform agnostic, validated via schema validators (e.g. Zod), and immune to internal IndexedDB implementation changes.

#### 3.5 Schema Versioning and Migration Rules
- **Primary Source**: [Dexie Version.upgrade() Docs](https://dexie.org/docs/Version/Version.upgrade()).
- **Canonical Rules**:
  1. **Never alter past versions**: Once code with `version(1)` is deployed, never modify that block. Always append a new `db.version(2)`.
  2. **Schema diffing**: Dexie automatically compares versions and modifies or creates indexes/tables.
  3. **Data transformations in `.upgrade()`**: Run transforms inside `.upgrade(async trans => { ... })`. Dexie wraps this in an atomic read-write IndexedDB transaction. If an error is thrown, the entire schema migration rolls back.
  4. **Example Migration**:
     ```typescript
     // Future Version 2 Example: Adding tag support to Activities and migrating legacy status
     db.version(2)
       .stores({
         activities: 'id, &name, createdAt, totalMinutes, level, *tags', // Added multi-entry *tags index
         quests: 'id, activityId, status, dueDate, completedAt, [status+dueDate], [activityId+status], priority'
       })
       .upgrade(async trans => {
         // Populate default empty tags array on all existing activities
         await trans.table('activities').toCollection().modify(activity => {
           if (!activity.tags) {
             activity.tags = [];
           }
         });
       });
     ```

---

## Tradeoffs / Risks

1. **Denormalization vs Event Sourcing**:
   - *Risk*: Denormalizing `totalMinutes` and `level` on `activities` introduces the possibility of drift if a log is written outside the atomic transaction.
   - *Mitigation*: All writes to `timeLogs` must go through a single domain service module (`recordTimeLogAtomic`). Provide a diagnostic repair utility that iterates `timeLogs`, recalculates sums, and reconciles `activities` and `userProfile`.
2. **IndexedDB Index Size on Mobile PWAs**:
   - *Risk*: Adding too many compound indexes increases storage overhead on mobile browsers (Safari/Chrome IndexedDB).
   - *Mitigation*: Strictly limit indexes to query paths required by active views (`[activityId+timestamp]` and `[status+dueDate]`). Do not index fields like `notes`, `icon`, `color`, or `description`.
3. **Sparse Indexes with Null Values**:
   - *Risk*: In IndexedDB, records with `null` or `undefined` keys are excluded from indexes. A quest with `dueDate = null` will not appear in the `[status+dueDate]` compound index.
   - *Mitigation*: Backlog / unscheduled queries must query `db.quests.where('status').equals('active')` and filter null due dates in memory, or use `0` as sentinel.

---

## Recommendation

1. **Adopt String UUIDs (`crypto.randomUUID()`)** as primary keys for all tables (`activities`, `timeLogs`, `quests`, `achievements`, `userProfile`, `skills`).
2. **Implement Compound Indexes**:
   - `timeLogs`: `'id, activityId, timestamp, [activityId+timestamp]'`
   - `quests`: `'id, activityId, status, dueDate, completedAt, [status+dueDate], [activityId+status]'`
3. **Enforce Atomic Denormalization** for `totalMinutes`, `level`, and `totalHours` inside `db.transaction('rw', ...)`.
4. **Deploy Dual Export/Import Strategy**:
   - Use `dexie-export-import` for complete binary/Blob backups with `replace` and `merge` conflict options.
   - Provide a clean, typed JSON export (`LifeGamificationPortableV1`) for user-facing data portability and inspection.
5. **Update Ticket 02**: Use these schema definitions, query signatures, and backup specifications as the resolution reference.
