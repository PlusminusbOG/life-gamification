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

    it('handles multiple consecutive time logs with strictly cumulative, non-decreasing hours and zero drift', async () => {
      const activity = await service.createActivity({ name: 'Guitar Practice' });

      // Test multiple small logs to confirm no floating-point rounding drift
      // 6 logs of 10 minutes = 60 minutes = 1.00 hours
      for (let i = 0; i < 6; i++) {
        await service.logTime(activity.id, 10, `Session chunk ${i + 1}`);
      }

      let currentHero = await service.getHeroState();
      expect(currentHero.profile.totalMinutes).toBe(60);
      expect(currentHero.profile.totalHours).toBe(1.0);

      // Add another 90 minutes (1.5 hours)
      await service.logTime({
        activityId: activity.id,
        durationMinutes: 90,
      });

      currentHero = await service.getHeroState();
      expect(currentHero.profile.totalMinutes).toBe(150);
      expect(currentHero.profile.totalHours).toBe(2.5);

      const updatedActivity = await service.getActivity(activity.id);
      expect(updatedActivity!.totalMinutes).toBe(150);

      // Check timeLogs query for this activity
      const logs = await service.getTimeLogs(activity.id);
      expect(logs).toHaveLength(7);
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

  describe('Quest Management (Ticket 03)', () => {
    it('verifies db.quests table exists with compound and query indexes', async () => {
      expect(db.quests).toBeDefined();
      const schema = db.tables.find((t) => t.name === 'quests')?.schema;
      expect(schema).toBeDefined();
      expect(schema?.primKey.name).toBe('id');
      const indexNames = schema?.indexes.map((idx) => idx.name);
      expect(indexNames).toContain('activityId');
      expect(indexNames).toContain('status');
      expect(indexNames).toContain('dueDate');
      expect(indexNames).toContain('completedAt');
      expect(indexNames).toContain('[status+dueDate]');
      expect(indexNames).toContain('[activityId+status]');
    });

    it('creates custom quests with title, optional activity link, and XP reward (+15m, +30m, +45m, +1h, +2h)', async () => {
      const activity = await service.createActivity({ name: 'Filosofia' });

      // Quest with activity link and 45m reward
      const quest1 = await service.createQuest({
        title: 'Прочитать 30 страниц книги',
        activityId: activity.id,
        rewardMinutes: 45,
        dueDate: Date.now(),
      });

      expect(quest1.id).toBeDefined();
      expect(quest1.title).toBe('Прочитать 30 страниц книги');
      expect(quest1.activityId).toBe(activity.id);
      expect(quest1.rewardMinutes).toBe(45);
      expect(quest1.status).toBe('active');
      expect(quest1.completedAt).toBeUndefined();

      // Backlog quest without activity link (default 30m reward)
      const quest2 = await service.createQuest({
        title: 'Навести порядок на рабочем месте',
      });

      expect(quest2.activityId).toBeUndefined();
      expect(quest2.rewardMinutes).toBe(30);
      expect(quest2.status).toBe('active');
      expect(quest2.dueDate).toBeNull();
    });

    it('filters quests into Today and Backlog categories', async () => {
      const now = Date.now();
      const todayQuest = await service.createQuest({
        title: 'Утренняя пробежка 5 км',
        rewardMinutes: 30,
        dueDate: now,
      });

      const backlogQuest = await service.createQuest({
        title: 'Написать главу диплома',
        rewardMinutes: 120,
        dueDate: null,
      });

      const allActive = await service.getQuests({ status: 'active' });
      expect(allActive).toHaveLength(2);

      const todayQuests = await service.getQuests({ status: 'active', isToday: true });
      expect(todayQuests).toHaveLength(1);
      expect(todayQuests[0].id).toBe(todayQuest.id);

      const backlogQuests = await service.getQuests({ status: 'active', isToday: false });
      expect(backlogQuests).toHaveLength(1);
      expect(backlogQuests[0].id).toBe(backlogQuest.id);
    });

    it('completing a quest atomically marks it completed, logs corresponding XP minutes to linked Activity, and recalculates levels', async () => {
      const activity = await service.createActivity({ name: 'Спорт' });
      expect(activity.totalMinutes).toBe(0);
      expect(activity.level).toBe(1);

      const quest = await service.createQuest({
        title: 'Интенсивная тренировка в зале',
        activityId: activity.id,
        rewardMinutes: 60, // +1h XP
        dueDate: Date.now(),
      });

      const result = await service.completeQuest(quest.id);

      expect(result.quest.status).toBe('completed');
      expect(result.quest.completedAt).toBeGreaterThan(0);
      expect(result.timeLog).toBeDefined();
      expect(result.timeLog?.durationMinutes).toBe(60);
      expect(result.timeLog?.activityId).toBe(activity.id);

      // Verify activity was updated: 60 min -> Level 4
      const updatedActivity = await service.getActivity(activity.id);
      expect(updatedActivity!.totalMinutes).toBe(60);
      expect(updatedActivity!.level).toBe(4);

      // Verify Hero Profile totalHours was updated
      const hero = await service.getHeroState();
      expect(hero.profile.totalMinutes).toBe(60);
      expect(hero.profile.totalHours).toBe(1.0);
    });

    it('completing a quest without activity link still awards XP to the hero profile', async () => {
      const quest = await service.createQuest({
        title: 'Генеральная уборка',
        rewardMinutes: 30,
      });

      const result = await service.completeQuest(quest.id);
      expect(result.quest.status).toBe('completed');
      expect(result.timeLog).toBeUndefined();

      const hero = await service.getHeroState();
      expect(hero.profile.totalMinutes).toBe(30);
      expect(hero.profile.totalHours).toBe(0.5);
    });

    it('rejects completing an already completed quest with a clear error', async () => {
      const quest = await service.createQuest({
        title: 'Разовое поручение',
        rewardMinutes: 15,
      });

      await service.completeQuest(quest.id);

      await expect(service.completeQuest(quest.id)).rejects.toThrow(
        /уже выполнен/i
      );
    });

    it('deletes a quest cleanly', async () => {
      const quest = await service.createQuest({
        title: 'Удаляемый квест',
      });

      await service.deleteQuest(quest.id);
      const fetched = await service.getQuest(quest.id);
      expect(fetched).toBeUndefined();
    });
  });

  describe('Pinned Badges Management (Ticket 05)', () => {
    it('persists up to 5 pinned badge codes in userProfile', async () => {
      const initialBadges = await service.getPinnedBadges();
      expect(initialBadges).toEqual([]);

      const toPin = ['CRONUS_10H', 'HERACLES_1Q', 'ARIADNE_3D'];
      await service.updatePinnedBadges(toPin);

      const saved = await service.getPinnedBadges();
      expect(saved).toEqual(toPin);

      // Verify capping to 5
      const sixCodes = ['1', '2', '3', '4', '5', '6'];
      await service.updatePinnedBadges(sixCodes);
      const capped = await service.getPinnedBadges();
      expect(capped).toHaveLength(5);
      expect(capped).toEqual(['1', '2', '3', '4', '5']);
    });
  });
});
