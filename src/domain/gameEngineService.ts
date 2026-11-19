import type { LifeGamificationDB } from './db';
import type {
  Activity,
  TimeLog,
  UserProfile,
  HeroState,
  CreateActivityInput,
  LogTimeInput,
} from './types';
import { calculateLevel } from './progression';

export interface GameEngineService {
  createActivity(input: CreateActivityInput): Promise<Activity>;
  getActivities(): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity | undefined>;
  logTime(input: LogTimeInput): Promise<TimeLog>;
  getTimeLogs(activityId?: string): Promise<TimeLog[]>;
  getHeroState(): Promise<HeroState>;
  ensureProfile(): Promise<UserProfile>;
}

export function createGameEngineService(db: LifeGamificationDB): GameEngineService {
  async function ensureProfile(): Promise<UserProfile> {
    const existing = await db.userProfile.get('me');
    if (existing) return existing;

    const initialProfile: UserProfile = {
      id: 'me',
      name: 'Hero of Hellas',
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
      throw new Error('Activity name cannot be empty');
    }

    const existing = await db.activities.where('name').equalsIgnoreCase(trimmedName).first();
    if (existing) {
      throw new Error(`Activity with name "${trimmedName}" already exists`);
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

  async function logTime(input: LogTimeInput): Promise<TimeLog> {
    if (input.durationMinutes <= 0) {
      throw new Error('Duration must be greater than zero');
    }

    const now = Date.now();
    const newLog: TimeLog = {
      id: crypto.randomUUID(),
      activityId: input.activityId,
      durationMinutes: input.durationMinutes,
      timestamp: input.timestamp ?? now,
      notes: input.notes?.trim() || undefined,
      createdAt: now,
    };

    await db.transaction('rw', [db.activities, db.timeLogs, db.userProfile], async () => {
      const activity = await db.activities.get(input.activityId);
      if (!activity) {
        throw new Error(`Activity not found: ${input.activityId}`);
      }

      // 1. Insert time log
      await db.timeLogs.add(newLog);

      // 2. Denormalize on Activity (O(1) read afterwards)
      const updatedTotalMinutes = activity.totalMinutes + newLog.durationMinutes;
      const updatedLevel = calculateLevel(updatedTotalMinutes);

      await db.activities.update(activity.id, {
        totalMinutes: updatedTotalMinutes,
        level: updatedLevel,
        updatedAt: now,
      });

      // 3. Denormalize on UserProfile (O(1) hero total hours)
      let profile = await db.userProfile.get('me');
      if (!profile) {
        profile = {
          id: 'me',
          name: 'Hero of Hellas',
          totalHours: 0,
          createdAt: now,
          updatedAt: now,
        };
        await db.userProfile.put(profile);
      }

      const addedHours = newLog.durationMinutes / 60;
      const newTotalHours = Math.round((profile.totalHours + addedHours) * 100) / 100;

      await db.userProfile.update('me', {
        totalHours: newTotalHours,
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

  return {
    createActivity,
    getActivities,
    getActivity,
    logTime,
    getTimeLogs,
    getHeroState,
    ensureProfile,
  };
}
