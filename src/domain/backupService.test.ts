import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LifeGamificationDB } from './db';
import {
  exportDatabaseBackup,
  importDatabaseBackup,
  validateBackupBlob,
  generateBackupFilename,
} from './backupService';
import type { Activity, TimeLog, Quest, Achievement, UserProfile } from './types';

describe('Ticket 06: Backup & Data Sovereignty Service (dexie-export-import)', () => {
  let db: LifeGamificationDB;
  const testDbName = `test_backup_db_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  beforeEach(async () => {
    db = new LifeGamificationDB(testDbName);
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('1. generateBackupFilename', () => {
    it('generates filename with life-gamification-backup prefix, timestamp, and .json extension', () => {
      const filename = generateBackupFilename(1700000000000);
      expect(filename).toBe('life-gamification-backup-1700000000000.json');
    });

    it('defaults to current timestamp if none provided', () => {
      const filename = generateBackupFilename();
      expect(filename).toMatch(/^life-gamification-backup-\d+\.json$/);
    });
  });

  describe('2. Export and Metadata Validation', () => {
    it('exports a valid JSON blob containing all database tables and verifies metadata', async () => {
      // 1. Seed sample data
      const now = Date.now();
      const mockProfile: UserProfile = {
        id: 'me',
        name: 'Одиссей',
        totalMinutes: 600,
        totalHours: 10.0,
        pinnedBadgeCodes: ['CRONUS_10H'],
        createdAt: now,
        updatedAt: now,
      };
      await db.userProfile.put(mockProfile);

      const mockActivity: Activity = {
        id: 'act-1',
        name: 'Чтение',
        totalMinutes: 300,
        level: 5,
        createdAt: now,
        updatedAt: now,
      };
      await db.activities.add(mockActivity);

      const mockLog: TimeLog = {
        id: 'log-1',
        activityId: 'act-1',
        durationMinutes: 60,
        timestamp: now,
        notes: 'Глава 1',
        createdAt: now,
      };
      await db.timeLogs.add(mockLog);

      const mockQuest: Quest = {
        id: 'quest-1',
        title: 'Прочитать 50 страниц',
        activityId: 'act-1',
        status: 'active',
        rewardMinutes: 30,
        dueDate: null,
        createdAt: now,
      };
      await db.quests.add(mockQuest);

      const mockAchievement: Achievement = {
        id: 'ach-1',
        code: 'CRONUS_10H',
        unlockedAt: now,
        progress: 10,
      };
      await db.achievements.add(mockAchievement);

      // 2. Export database
      const backupBlob = await exportDatabaseBackup(db);
      expect(backupBlob).toBeDefined();
      expect(backupBlob.size).toBeGreaterThan(0);

      // 3. Validate metadata
      const metadata = await validateBackupBlob(backupBlob);
      expect(metadata.totalRows).toBe(5);
      expect(metadata.tableCounts.userProfile).toBe(1);
      expect(metadata.tableCounts.activities).toBe(1);
      expect(metadata.tableCounts.timeLogs).toBe(1);
      expect(metadata.tableCounts.quests).toBe(1);
      expect(metadata.tableCounts.achievements).toBe(1);
    });
  });

  describe('3. Lossless Round-Trip Restore (mode: replace)', () => {
    it('exports database, wipes tables, and imports backup with 100% zero data loss', async () => {
      const now = 1700000000000;

      // Seed comprehensive state
      await db.userProfile.put({
        id: 'me',
        name: 'Ахиллес',
        totalMinutes: 1200,
        totalHours: 20.0,
        pinnedBadgeCodes: ['CRONUS_10H', 'HERACLES_1Q'],
        createdAt: now,
        updatedAt: now,
      });

      await db.activities.bulkAdd([
        {
          id: 'act-reading',
          name: 'Чтение',
          totalMinutes: 600,
          level: 8,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'act-coding',
          name: 'Кодинг',
          totalMinutes: 600,
          level: 8,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      await db.timeLogs.bulkAdd([
        {
          id: 'log-1',
          activityId: 'act-reading',
          durationMinutes: 60,
          timestamp: now,
          notes: 'Илиада',
          createdAt: now,
        },
        {
          id: 'log-2',
          activityId: 'act-coding',
          durationMinutes: 120,
          timestamp: now + 1000,
          notes: 'TypeScript',
          createdAt: now + 1000,
        },
      ]);

      await db.quests.bulkAdd([
        {
          id: 'q-1',
          title: 'Подвиг 1',
          activityId: 'act-coding',
          status: 'completed',
          rewardMinutes: 30,
          completedAt: now,
          createdAt: now,
        },
        {
          id: 'q-2',
          title: 'Подвиг 2',
          status: 'active',
          rewardMinutes: 15,
          dueDate: now + 86400000,
          createdAt: now,
        },
      ]);

      await db.achievements.bulkAdd([
        {
          id: 'ach-1',
          code: 'CRONUS_10H',
          unlockedAt: now,
          progress: 10,
        },
        {
          id: 'ach-2',
          code: 'HERACLES_1Q',
          unlockedAt: now,
          progress: 1,
        },
      ]);

      // 1. Export database to JSON Blob
      const backupBlob = await exportDatabaseBackup(db);

      // 2. Wipe database completely
      await db.transaction('rw', [db.userProfile, db.activities, db.timeLogs, db.quests, db.achievements], async () => {
        await db.userProfile.clear();
        await db.activities.clear();
        await db.timeLogs.clear();
        await db.quests.clear();
        await db.achievements.clear();
      });

      // Confirm clean state
      expect(await db.activities.count()).toBe(0);
      expect(await db.timeLogs.count()).toBe(0);
      expect(await db.quests.count()).toBe(0);
      expect(await db.achievements.count()).toBe(0);
      expect(await db.userProfile.get('me')).toBeUndefined();

      // 3. Restore database from backup in 'replace' mode
      const result = await importDatabaseBackup(db, backupBlob, { mode: 'replace' });
      expect(result.totalImportedRows).toBe(9);

      // 4. Assert 100% loss-free restoration of all entities
      const restoredProfile = await db.userProfile.get('me');
      expect(restoredProfile).toBeDefined();
      expect(restoredProfile?.name).toBe('Ахиллес');
      expect(restoredProfile?.totalMinutes).toBe(1200);
      expect(restoredProfile?.totalHours).toBe(20.0);
      expect(restoredProfile?.pinnedBadgeCodes).toEqual(['CRONUS_10H', 'HERACLES_1Q']);

      const restoredActivities = await db.activities.toArray();
      expect(restoredActivities).toHaveLength(2);
      expect(restoredActivities.find((a) => a.id === 'act-reading')?.totalMinutes).toBe(600);
      expect(restoredActivities.find((a) => a.id === 'act-coding')?.level).toBe(8);

      const restoredLogs = await db.timeLogs.toArray();
      expect(restoredLogs).toHaveLength(2);
      expect(restoredLogs.find((l) => l.id === 'log-1')?.notes).toBe('Илиада');

      const restoredQuests = await db.quests.toArray();
      expect(restoredQuests).toHaveLength(2);
      expect(restoredQuests.find((q) => q.id === 'q-1')?.status).toBe('completed');

      const restoredAchievements = await db.achievements.toArray();
      expect(restoredAchievements).toHaveLength(2);
      expect(restoredAchievements.find((a) => a.code === 'CRONUS_10H')?.unlockedAt).toBe(now);
    });
  });

  describe('4. Merge Mode (mode: merge)', () => {
    it('merges imported records into existing database without dropping existing unique records', async () => {
      const now = Date.now();

      // Database has existing item: act-1
      await db.activities.add({
        id: 'act-1',
        name: 'Бег',
        totalMinutes: 100,
        level: 3,
        createdAt: now,
        updatedAt: now,
      });

      // Backup contains: act-1 (updated minutes) AND act-2 (new)
      const separateDb = new LifeGamificationDB(`temp_${Date.now()}`);
      await separateDb.open();
      await separateDb.activities.bulkAdd([
        {
          id: 'act-1',
          name: 'Бег',
          totalMinutes: 200,
          level: 4,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'act-2',
          name: 'Плавание',
          totalMinutes: 50,
          level: 2,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      const backupBlob = await exportDatabaseBackup(separateDb);
      await separateDb.delete();

      // Import in merge mode into db
      await importDatabaseBackup(db, backupBlob, { mode: 'merge' });

      const all = await db.activities.toArray();
      expect(all).toHaveLength(2);

      const act1 = all.find((a) => a.id === 'act-1');
      expect(act1?.totalMinutes).toBe(200); // Updated via merge

      const act2 = all.find((a) => a.id === 'act-2');
      expect(act2?.name).toBe('Плавание'); // Added
    });
  });

  describe('5. Error Handling', () => {
    it('rejects corrupted or non-JSON files with descriptive error message', async () => {
      const corruptBlob = new Blob(['not a json file at all'], { type: 'text/plain' });

      await expect(validateBackupBlob(corruptBlob)).rejects.toThrow(
        /Некорректный формат файла резервной копии/i
      );

      await expect(importDatabaseBackup(db, corruptBlob, { mode: 'replace' })).rejects.toThrow(
        /Некорректный формат файла резервной копии/i
      );
    });
  });
});
