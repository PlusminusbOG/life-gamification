import Dexie, { type EntityTable } from 'dexie';
import type { Activity, TimeLog, UserProfile } from './types';

export class LifeGamificationDB extends Dexie {
  activities!: EntityTable<Activity, 'id'>;
  timeLogs!: EntityTable<TimeLog, 'id'>;
  userProfile!: EntityTable<UserProfile, 'id'>;

  constructor(databaseName = 'LifeGamificationDB') {
    super(databaseName);

    this.version(1).stores({
      activities: 'id, &name, createdAt, totalMinutes, level',
      timeLogs: 'id, activityId, timestamp, [activityId+timestamp]',
      userProfile: 'id',
    });
  }
}

export const db = new LifeGamificationDB();
