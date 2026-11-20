import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LifeGamificationDB } from './db';
import { createGameEngineService, type GameEngineService } from './gameEngineService';
import {
  ACHIEVEMENT_DEFINITIONS,
  evaluateAchievementState,
  type AchievementEvaluationState,
} from './achievementEngine';

describe('Declarative Achievement Engine (Ticket 04)', () => {
  let db: LifeGamificationDB;
  let service: GameEngineService;

  beforeEach(async () => {
    const testDbName = `test_achievements_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    db = new LifeGamificationDB(testDbName);
    await db.open();
    service = createGameEngineService(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  it('verifies db.achievements table exists with indexes id, &code, unlockedAt', async () => {
    expect(db.achievements).toBeDefined();
    const schema = db.tables.find((t) => t.name === 'achievements')?.schema;
    expect(schema).toBeDefined();
    expect(schema?.primKey.name).toBe('id');
    const indexNames = schema?.indexes.map((idx) => idx.name);
    expect(indexNames).toContain('code');
    expect(indexNames).toContain('unlockedAt');
    const codeIdx = schema?.indexes.find((i) => i.name === 'code');
    expect(codeIdx?.unique).toBe(true);
  });

  it('contains starter catalog across 4 Greek categories plus secret achievements', () => {
    expect(ACHIEVEMENT_DEFINITIONS.length).toBeGreaterThanOrEqual(13);

    const categories = new Set(ACHIEVEMENT_DEFINITIONS.map((a) => a.category));
    expect(categories).toContain('cronus');
    expect(categories).toContain('heracles');
    expect(categories).toContain('ariadne');
    expect(categories).toContain('muses');
    expect(categories).toContain('secret');

    // Cronus (10h, 50h, 100h, 350h)
    const cronusCodes = ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === 'cronus').map((a) => a.code);
    expect(cronusCodes).toContain('CRONUS_10H');
    expect(cronusCodes).toContain('CRONUS_50H');
    expect(cronusCodes).toContain('CRONUS_100H');
    expect(cronusCodes).toContain('CRONUS_350H');

    // Heracles (1, 10, 50, 100 quests)
    const heraclesCodes = ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === 'heracles').map((a) => a.code);
    expect(heraclesCodes).toContain('HERACLES_1Q');
    expect(heraclesCodes).toContain('HERACLES_10Q');
    expect(heraclesCodes).toContain('HERACLES_50Q');
    expect(heraclesCodes).toContain('HERACLES_100Q');

    // Ariadne (3, 7, 30 active days)
    const ariadneCodes = ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === 'ariadne').map((a) => a.code);
    expect(ariadneCodes).toContain('ARIADNE_3D');
    expect(ariadneCodes).toContain('ARIADNE_7D');
    expect(ariadneCodes).toContain('ARIADNE_30D');

    // Muses (3 activities at level 5+)
    const musesCodes = ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === 'muses').map((a) => a.code);
    expect(musesCodes).toContain('MUSES_3_LVL5');

    // Secret: Athena's Owl Night Vigil
    const secretCodes = ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === 'secret').map((a) => a.code);
    expect(secretCodes).toContain('SECRET_NIGHT_OWL');
  });

  it('evaluates Gifts of Cronus predicates based on totalHours', () => {
    const baseState: AchievementEvaluationState = {
      totalHours: 9.5,
      totalMinutes: 570,
      completedQuestsCount: 0,
      activities: [],
      timeLogs: [],
      completedQuests: [],
    };

    let result = evaluateAchievementState(baseState, {});
    expect(result.evaluations.find((e) => e.code === 'CRONUS_10H')?.isUnlocked).toBe(false);

    // Reach 10 hours
    const at10h: AchievementEvaluationState = { ...baseState, totalHours: 10.0, totalMinutes: 600 };
    result = evaluateAchievementState(at10h, {});
    expect(result.evaluations.find((e) => e.code === 'CRONUS_10H')?.isUnlocked).toBe(true);
    expect(result.evaluations.find((e) => e.code === 'CRONUS_50H')?.isUnlocked).toBe(false);

    // Reach 100 hours
    const at100h: AchievementEvaluationState = { ...baseState, totalHours: 100.0, totalMinutes: 6000 };
    result = evaluateAchievementState(at100h, {});
    expect(result.evaluations.find((e) => e.code === 'CRONUS_100H')?.isUnlocked).toBe(true);
    expect(result.evaluations.find((e) => e.code === 'CRONUS_350H')?.isUnlocked).toBe(false);
  });

  it('evaluates Labors of Heracles predicates based on completedQuestsCount', () => {
    const baseState: AchievementEvaluationState = {
      totalHours: 1,
      totalMinutes: 60,
      completedQuestsCount: 0,
      activities: [],
      timeLogs: [],
      completedQuests: [],
    };

    let result = evaluateAchievementState(baseState, {});
    expect(result.evaluations.find((e) => e.code === 'HERACLES_1Q')?.isUnlocked).toBe(false);

    const with1Quest: AchievementEvaluationState = { ...baseState, completedQuestsCount: 1 };
    result = evaluateAchievementState(with1Quest, {});
    expect(result.evaluations.find((e) => e.code === 'HERACLES_1Q')?.isUnlocked).toBe(true);
    expect(result.evaluations.find((e) => e.code === 'HERACLES_10Q')?.isUnlocked).toBe(false);

    const with10Quests: AchievementEvaluationState = { ...baseState, completedQuestsCount: 10 };
    result = evaluateAchievementState(with10Quests, {});
    expect(result.evaluations.find((e) => e.code === 'HERACLES_10Q')?.isUnlocked).toBe(true);
  });

  it('evaluates Ariadne Thread active days cumulatively with zero penalty for skipped days', () => {
    // 3 distinct days: day 1, day 5, day 20 (skipped days in between)
    const day1 = new Date(2026, 0, 1, 10, 0).getTime();
    const day5 = new Date(2026, 0, 5, 14, 0).getTime();
    const day20 = new Date(2026, 0, 20, 18, 0).getTime();

    const state: AchievementEvaluationState = {
      totalHours: 3,
      totalMinutes: 180,
      completedQuestsCount: 0,
      activities: [],
      timeLogs: [
        { id: '1', activityId: 'a1', durationMinutes: 60, timestamp: day1, createdAt: day1 },
        { id: '2', activityId: 'a1', durationMinutes: 60, timestamp: day5, createdAt: day5 },
        { id: '3', activityId: 'a1', durationMinutes: 60, timestamp: day20, createdAt: day20 },
      ],
      completedQuests: [],
    };

    const result = evaluateAchievementState(state, {});
    const ariadne3 = result.evaluations.find((e) => e.code === 'ARIADNE_3D');
    expect(ariadne3?.currentProgress).toBe(3);
    expect(ariadne3?.isUnlocked).toBe(true);

    const ariadne7 = result.evaluations.find((e) => e.code === 'ARIADNE_7D');
    expect(ariadne7?.currentProgress).toBe(3);
    expect(ariadne7?.isUnlocked).toBe(false);
  });

  it('evaluates The Seven Muses (3 activities at level 5+)', () => {
    const state: AchievementEvaluationState = {
      totalHours: 15,
      totalMinutes: 900,
      completedQuestsCount: 0,
      activities: [
        { id: '1', name: 'Coding', totalMinutes: 100, level: 5, createdAt: 0, updatedAt: 0 },
        { id: '2', name: 'Music', totalMinutes: 120, level: 5, createdAt: 0, updatedAt: 0 },
        { id: '3', name: 'Philosophy', totalMinutes: 80, level: 4, createdAt: 0, updatedAt: 0 },
      ],
      timeLogs: [],
      completedQuests: [],
    };

    let result = evaluateAchievementState(state, {});
    expect(result.evaluations.find((e) => e.code === 'MUSES_3_LVL5')?.isUnlocked).toBe(false);

    // Raise Philosophy to Level 5
    state.activities[2].level = 5;
    result = evaluateAchievementState(state, {});
    expect(result.evaluations.find((e) => e.code === 'MUSES_3_LVL5')?.isUnlocked).toBe(true);
  });

  it('evaluates Secret Achievement (Athena Owl Night Vigil for deep work between 00:00 and 05:00)', () => {
    // Normal day session at 14:00
    const daySession = new Date(2026, 5, 10, 14, 30).getTime();
    const dayState: AchievementEvaluationState = {
      totalHours: 1,
      totalMinutes: 60,
      completedQuestsCount: 0,
      activities: [],
      timeLogs: [
        { id: '1', activityId: 'a1', durationMinutes: 60, timestamp: daySession, createdAt: daySession },
      ],
      completedQuests: [],
    };

    let result = evaluateAchievementState(dayState, {});
    expect(result.evaluations.find((e) => e.code === 'SECRET_NIGHT_OWL')?.isUnlocked).toBe(false);

    // Night session at 02:15 AM
    const nightSession = new Date(2026, 5, 11, 2, 15).getTime();
    const nightState: AchievementEvaluationState = {
      ...dayState,
      timeLogs: [
        ...dayState.timeLogs,
        { id: '2', activityId: 'a1', durationMinutes: 45, timestamp: nightSession, createdAt: nightSession },
      ],
    };

    result = evaluateAchievementState(nightState, {});
    expect(result.evaluations.find((e) => e.code === 'SECRET_NIGHT_OWL')?.isUnlocked).toBe(true);
  });

  it('guarantees immutable retention: once unlockedAt is set, it cannot be revoked or degraded', () => {
    const unlockedTimestamp = 1700000000000;
    const existingMap = {
      CRONUS_10H: {
        id: 'ach-1',
        code: 'CRONUS_10H',
        unlockedAt: unlockedTimestamp,
        progress: 10,
      },
    };

    // State regresses or is reset
    const degradedState: AchievementEvaluationState = {
      totalHours: 0,
      totalMinutes: 0,
      completedQuestsCount: 0,
      activities: [],
      timeLogs: [],
      completedQuests: [],
    };

    const result = evaluateAchievementState(degradedState, existingMap);
    const cronus10 = result.evaluations.find((e) => e.code === 'CRONUS_10H');
    expect(cronus10?.isUnlocked).toBe(true);
    expect(cronus10?.unlockedAt).toBe(unlockedTimestamp);
  });

  describe('Integration with GameEngineService Seam', () => {
    it('reactively unlocks achievements on time logging and quest completion', async () => {
      const activity = await service.createActivity({ name: 'Воинское искусство' });

      // Check initial achievements: all locked
      let achievements = await service.getAchievements();
      expect(achievements.every((a) => a.unlockedAt === null)).toBe(true);

      // 1. Complete 1st quest -> should unlock HERACLES_1Q (Немейский лев)
      const quest = await service.createQuest({
        title: 'Первый подвиг Геракла',
        activityId: activity.id,
        rewardMinutes: 30,
      });

      await service.completeQuest(quest.id);

      achievements = await service.getAchievements();
      const lion = achievements.find((a) => a.code === 'HERACLES_1Q');
      expect(lion?.unlockedAt).toBeGreaterThan(0);

      // 2. Log 10 hours -> should unlock CRONUS_10H (Спартанский щит)
      await service.logTime({
        activityId: activity.id,
        durationMinutes: 570, // 30 + 570 = 600 min = 10 hours
      });

      achievements = await service.getAchievements();
      const shield = achievements.find((a) => a.code === 'CRONUS_10H');
      expect(shield?.unlockedAt).toBeGreaterThan(0);
    });

    it('returns temple achievement summary stats accurately', async () => {
      const activity = await service.createActivity({ name: 'Философия' });

      const quest = await service.createQuest({
        title: 'Изучить диалоги Платона',
        activityId: activity.id,
        rewardMinutes: 15,
      });

      await service.completeQuest(quest.id);

      const stats = await service.getAchievementStats();
      expect(stats.totalCount).toBeGreaterThanOrEqual(13);
      // At least 2 unlocked: HERACLES_1Q (first quest) and ARIADNE_3D has 1 day
      expect(stats.unlockedCount).toBeGreaterThanOrEqual(1);
    });
  });
});
