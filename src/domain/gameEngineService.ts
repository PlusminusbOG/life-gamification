import type { LifeGamificationDB } from './db';
import type {
  Activity,
  TimeLog,
  UserProfile,
  HeroState,
  CreateActivityInput,
  LogTimeInput,
  Quest,
  QuestStatus,
  CreateQuestInput,
  CompleteQuestResult,
} from './types';
import { calculateLevel } from './progression';

export interface GameEngineService {
  createActivity(input: CreateActivityInput): Promise<Activity>;
  getActivities(): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity | undefined>;
  logTime(
    inputOrActivityId: LogTimeInput | string,
    durationMinutes?: number,
    notes?: string,
    timestamp?: number
  ): Promise<TimeLog>;
  getTimeLogs(activityId?: string): Promise<TimeLog[]>;
  getHeroState(): Promise<HeroState>;
  ensureProfile(): Promise<UserProfile>;

  // Тикет 03: Квесты
  createQuest(input: CreateQuestInput): Promise<Quest>;
  getQuests(filter?: { status?: QuestStatus; isToday?: boolean }): Promise<Quest[]>;
  getQuest(id: string): Promise<Quest | undefined>;
  completeQuest(questId: string): Promise<CompleteQuestResult>;
  deleteQuest(id: string): Promise<void>;
}

export function createGameEngineService(db: LifeGamificationDB): GameEngineService {
  async function ensureProfile(): Promise<UserProfile> {
    const existing = await db.userProfile.get('me');
    if (existing) return existing;

    const initialProfile: UserProfile = {
      id: 'me',
      name: 'Герой Эллады',
      totalMinutes: 0,
      totalHours: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.userProfile.put(initialProfile);
    return initialProfile;
  }

  async function createActivity(input: CreateActivityInput): Promise<Activity> {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      throw new Error('Название занятия не может быть пустым');
    }

    const existing = await db.activities.where('name').equalsIgnoreCase(trimmedName).first();
    if (existing) {
      throw new Error(`Занятие с названием "${trimmedName}" уже существует (already exists)`);
    }

    const now = Date.now();
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name: trimmedName,
      totalMinutes: 0,
      level: 1,
      icon: input.icon,
      color: input.color,
      createdAt: now,
      updatedAt: now,
    };

    await db.activities.add(newActivity);
    return newActivity;
  }

  async function getActivities(): Promise<Activity[]> {
    return await db.activities.orderBy('createdAt').toArray();
  }

  async function getActivity(id: string): Promise<Activity | undefined> {
    return await db.activities.get(id);
  }

  async function logTime(
    inputOrActivityId: LogTimeInput | string,
    durationMinutesArg?: number,
    notesArg?: string,
    timestampArg?: number
  ): Promise<TimeLog> {
    let activityId: string;
    let durationMinutes: number;
    let notes: string | undefined;
    let timestamp: number | undefined;

    if (typeof inputOrActivityId === 'string') {
      activityId = inputOrActivityId;
      durationMinutes = durationMinutesArg ?? 0;
      notes = notesArg;
      timestamp = timestampArg;
    } else {
      activityId = inputOrActivityId.activityId;
      durationMinutes = inputOrActivityId.durationMinutes;
      notes = inputOrActivityId.notes;
      timestamp = inputOrActivityId.timestamp;
    }

    if (durationMinutes <= 0) {
      throw new Error('Длительность должна быть больше нуля');
    }

    const now = Date.now();
    const newLog: TimeLog = {
      id: crypto.randomUUID(),
      activityId,
      durationMinutes,
      timestamp: timestamp ?? now,
      notes: notes?.trim() || undefined,
      createdAt: now,
    };

    await db.transaction('rw', [db.activities, db.timeLogs, db.userProfile], async () => {
      const activity = await db.activities.get(activityId);
      if (!activity) {
        throw new Error(`Занятие не найдено: ${activityId} (activity not found)`);
      }

      // 1. Вставка лога времени
      await db.timeLogs.add(newLog);

      // 2. Денормализация на Активности (O(1) последующее чтение)
      const updatedTotalMinutes = activity.totalMinutes + newLog.durationMinutes;
      const updatedLevel = calculateLevel(updatedTotalMinutes);

      await db.activities.update(activity.id, {
        totalMinutes: updatedTotalMinutes,
        level: updatedLevel,
        updatedAt: now,
      });

      // 3. Денормализация на UserProfile (O(1) часы героя без дрейфа float)
      const profile = await ensureProfile();
      const updatedHeroMinutes = (profile.totalMinutes ?? 0) + newLog.durationMinutes;
      const updatedTotalHours = Math.round((updatedHeroMinutes / 60) * 100) / 100;

      await db.userProfile.update('me', {
        totalMinutes: updatedHeroMinutes,
        totalHours: updatedTotalHours,
        updatedAt: now,
      });
    });

    return newLog;
  }

  async function getTimeLogs(activityId?: string): Promise<TimeLog[]> {
    if (activityId) {
      return await db.timeLogs
        .where('activityId')
        .equals(activityId)
        .sortBy('timestamp');
    }
    return await db.timeLogs.orderBy('timestamp').toArray();
  }

  async function getHeroState(): Promise<HeroState> {
    const profile = await ensureProfile();
    const activities = await getActivities();
    return {
      profile,
      activities,
    };
  }

  // ==========================================================================
  // Квесты (Ticket 03)
  // ==========================================================================

  async function createQuest(input: CreateQuestInput): Promise<Quest> {
    const trimmedTitle = input.title.trim();
    if (!trimmedTitle) {
      throw new Error('Название квеста не может быть пустым');
    }

    const now = Date.now();
    const newQuest: Quest = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      activityId: input.activityId || undefined,
      status: 'active',
      rewardMinutes: input.rewardMinutes ?? 30,
      dueDate: input.dueDate !== undefined ? input.dueDate : null,
      createdAt: now,
    };

    await db.quests.add(newQuest);
    return newQuest;
  }

  async function getQuests(filter?: {
    status?: QuestStatus;
    isToday?: boolean;
  }): Promise<Quest[]> {
    let all: Quest[];

    if (filter?.status) {
      all = await db.quests.where('status').equals(filter.status).toArray();
    } else {
      all = await db.quests.toArray();
    }

    all.sort((a, b) => b.createdAt - a.createdAt);

    if (filter?.isToday !== undefined) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

      return all.filter((q) => {
        const isDueToday =
          q.dueDate != null && q.dueDate >= startOfDay && q.dueDate <= endOfDay;
        return filter.isToday ? isDueToday : !isDueToday;
      });
    }

    return all;
  }

  async function getQuest(id: string): Promise<Quest | undefined> {
    return await db.quests.get(id);
  }

  async function completeQuest(questId: string): Promise<CompleteQuestResult> {
    const now = Date.now();
    let updatedQuest: Quest;
    let createdTimeLog: TimeLog | undefined;

    await db.transaction('rw', [db.quests, db.activities, db.timeLogs, db.userProfile], async () => {
      const quest = await db.quests.get(questId);
      if (!quest) {
        throw new Error(`Квест не найден: ${questId}`);
      }
      if (quest.status === 'completed') {
        throw new Error(`Квест уже выполнен: ${questId}`);
      }

      const rewardMinutes = quest.rewardMinutes || 30;

      // 1. Если квест привязан к активности, логируем время и пересчитываем уровень активности
      if (quest.activityId) {
        const activity = await db.activities.get(quest.activityId);
        if (activity) {
          createdTimeLog = {
            id: crypto.randomUUID(),
            activityId: quest.activityId,
            durationMinutes: rewardMinutes,
            timestamp: now,
            notes: `Награда за квест: «${quest.title}»`,
            createdAt: now,
          };
          await db.timeLogs.add(createdTimeLog);

          const updatedTotalMinutes = activity.totalMinutes + rewardMinutes;
          const updatedLevel = calculateLevel(updatedTotalMinutes);

          await db.activities.update(activity.id, {
            totalMinutes: updatedTotalMinutes,
            level: updatedLevel,
            updatedAt: now,
          });
        }
      }

      // 2. Обновляем пожизненный прогресс героя
      const profile = await ensureProfile();
      const updatedHeroMinutes = (profile.totalMinutes ?? 0) + rewardMinutes;
      const updatedTotalHours = Math.round((updatedHeroMinutes / 60) * 100) / 100;

      await db.userProfile.update('me', {
        totalMinutes: updatedHeroMinutes,
        totalHours: updatedTotalHours,
        updatedAt: now,
      });

      // 3. Отмечаем квест как выполненный
      updatedQuest = {
        ...quest,
        status: 'completed',
        completedAt: now,
      };
      await db.quests.put(updatedQuest);
    });

    return { quest: updatedQuest!, timeLog: createdTimeLog };
  }

  async function deleteQuest(id: string): Promise<void> {
    await db.quests.delete(id);
  }

  return {
    createActivity,
    getActivities,
    getActivity,
    logTime,
    getTimeLogs,
    getHeroState,
    ensureProfile,
    createQuest,
    getQuests,
    getQuest,
    completeQuest,
    deleteQuest,
  };
}
