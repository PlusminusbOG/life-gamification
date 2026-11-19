import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LifeGamificationDB } from './db';
import { createGameEngineService, type GameEngineService } from './gameEngineService';

describe('GameEngineService (Primary Seam)', () => {
  let db: LifeGamificationDB;
  let service: GameEngineService;

  beforeEach(async () => {
    // Generate unique database name per test for complete isolation
    const testDbName = `test_db_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    db = new LifeGamificationDB(testDbName);
    await db.open();
    service = createGameEngineService(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('Activity Management', () => {
    it('creates an activity with initial level 1, totalMinutes 0, and client UUID', async () => {
      const activity = await service.createActivity({
        name: 'Coding',
        color: '#3b82f6',
        icon: 'Code',
      });

      expect(activity.id).toBeDefined();
      expect(typeof activity.id).toBe('string');
      expect(activity.name).toBe('Coding');
      expect(activity.totalMinutes).toBe(0);
      expect(activity.level).toBe(1);
      expect(activity.color).toBe('#3b82f6');
      expect(activity.icon).toBe('Code');
      expect(activity.createdAt).toBeGreaterThan(0);

      // Verify persistence via service
      const allActivities = await service.getActivities();
      expect(allActivities).toHaveLength(1);
      expect(allActivities[0]).toEqual(activity);
    });

    it('rejects duplicate activity names with a descriptive error', async () => {
      await service.createActivity({ name: 'Running' });

      await expect(service.createActivity({ name: 'Running' })).rejects.toThrow(
        /already exists/i
      );
    });
  });

  describe('Time Logging & Atomic Totals', () => {
    it('atomically records a time log, increments activity totalMinutes, updates level, and updates userProfile totalHours', async () => {
      const activity = await service.createActivity({ name: 'Reading Books' });
      expect(activity.totalMinutes).toBe(0);
      expect(activity.level).toBe(1);

      // Initial hero profile check
      const initialHero = await service.getHeroState();
      expect(initialHero.profile.totalHours).toBe(0);

      // Log 60 minutes (1 hour)
      const log = await service.logTime({
        activityId: activity.id,
        durationMinutes: 60,
        notes: 'Read chapters 1 and 2 of Odyssey',
      });

      expect(log.id).toBeDefined();
      expect(log.activityId).toBe(activity.id);
      expect(log.durationMinutes).toBe(60);
      expect(log.notes).toBe('Read chapters 1 and 2 of Odyssey');

      // Check updated activity
      const updatedActivity = await service.getActivity(activity.id);
      expect(updatedActivity).toBeDefined();
      expect(updatedActivity!.totalMinutes).toBe(60);
      // At 60m (1h), formula gives: 1 + floor(1^0.6 * 3) = 1 + 3 = Level 4
      expect(updatedActivity!.level).toBe(4);

      // Check updated hero profile
      const updatedHero = await service.getHeroState();
      expect(updatedHero.profile.totalHours).toBe(1);
    });

    it('handles multiple consecutive time logs with strictly cumulative, non-decreasing hours', async () => {
      const activity = await service.createActivity({ name: 'Guitar Practice' });

      // First log: 30 minutes
      await service.logTime({
        activityId: activity.id,
        durationMinutes: 30,
      });

      let currentHero = await service.getHeroState();
      expect(currentHero.profile.totalHours).toBe(0.5);

      // Second log: 90 minutes (1.5 hours)
      await service.logTime({
        activityId: activity.id,
        durationMinutes: 90,
      });

      currentHero = await service.getHeroState();
      expect(currentHero.profile.totalHours).toBe(2);

      const updatedActivity = await service.getActivity(activity.id);
      expect(updatedActivity!.totalMinutes).toBe(120);

      // Check timeLogs query for this activity
      const logs = await service.getTimeLogs(activity.id);
      expect(logs).toHaveLength(2);
      expect(logs[0].durationMinutes).toBe(30);
      expect(logs[1].durationMinutes).toBe(90);
    });

    it('throws error when attempting to log time to a non-existent activity', async () => {
      await expect(
        service.logTime({
          activityId: 'non-existent-uuid',
          durationMinutes: 45,
        })
      ).rejects.toThrow(/activity not found/i);
    });

    it('queries logs using compound index [activityId+timestamp] within date ranges', async () => {
      const activityA = await service.createActivity({ name: 'Activity A' });
      const activityB = await service.createActivity({ name: 'Activity B' });

      const t1 = 1700000000000;
      const t2 = 1700003600000;
      const t3 = 1700007200000;

      await service.logTime({ activityId: activityA.id, durationMinutes: 30, timestamp: t1 });
      await service.logTime({ activityId: activityA.id, durationMinutes: 45, timestamp: t2 });
      await service.logTime({ activityId: activityB.id, durationMinutes: 60, timestamp: t2 });
      await service.logTime({ activityId: activityA.id, durationMinutes: 15, timestamp: t3 });

      // Direct compound index check on db
      const rangeLogs = await db.timeLogs
        .where('[activityId+timestamp]')
        .between([activityA.id, t1], [activityA.id, t2], true, true)
        .toArray();

      expect(rangeLogs).toHaveLength(2);
      expect(rangeLogs[0].durationMinutes).toBe(30);
      expect(rangeLogs[1].durationMinutes).toBe(45);
    });

    it('verifies progression curve milestones (20m -> Lvl 2, 60m -> Lvl 4, 600m -> Lvl 12)', async () => {
      const activity = await service.createActivity({ name: 'Skill Progression Test' });

      // 20 minutes -> Level 2
      await service.logTime({ activityId: activity.id, durationMinutes: 20 });
      let act = await service.getActivity(activity.id);
      expect(act!.level).toBe(2);

      // +40 minutes (total 60m / 1h) -> Level 4
      await service.logTime({ activityId: activity.id, durationMinutes: 40 });
      act = await service.getActivity(activity.id);
      expect(act!.level).toBe(4);

      // +540 minutes (total 600m / 10h) -> Level 12
      await service.logTime({ activityId: activity.id, durationMinutes: 540 });
      act = await service.getActivity(activity.id);
      expect(act!.level).toBe(12);
    });
  });
});
