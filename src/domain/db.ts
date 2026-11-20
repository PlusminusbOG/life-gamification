import Dexie, { type EntityTable } from 'dexie';
import type { Activity, TimeLog, UserProfile, Quest, Achievement } from './types';

export class LifeGamificationDB extends Dexie {
  activities!: EntityTable<Activity, 'id'>;
  timeLogs!: EntityTable<TimeLog, 'id'>;
  userProfile!: EntityTable<UserProfile, 'id'>;
  quests!: EntityTable<Quest, 'id'>;
  achievements!: EntityTable<Achievement, 'id'>;

  constructor(databaseName = 'LifeGamificationDB') {
    super(databaseName);

    // Версия 1: Базовые таблицы занятий, логов и профиля
    this.version(1).stores({
      activities: 'id, &name, createdAt, totalMinutes, level',
      timeLogs: 'id, activityId, timestamp, [activityId+timestamp]',
      userProfile: 'id',
    });

    // Версия 2 (Тикет 03): Таблица квестов с составными индексами
    this.version(2).stores({
      activities: 'id, &name, createdAt, totalMinutes, level',
      timeLogs: 'id, activityId, timestamp, [activityId+timestamp]',
      userProfile: 'id',
      quests: 'id, activityId, status, dueDate, completedAt, createdAt, [status+dueDate], [activityId+status]',
    });

    // Версия 3 (Тикет 04): Декларативные несгораемые достижения Храма Олимпа
    this.version(3).stores({
      activities: 'id, &name, createdAt, totalMinutes, level',
      timeLogs: 'id, activityId, timestamp, [activityId+timestamp]',
      userProfile: 'id',
      quests: 'id, activityId, status, dueDate, completedAt, createdAt, [status+dueDate], [activityId+status]',
      achievements: 'id, &code, unlockedAt',
    });
  }
}

export const db = new LifeGamificationDB();
