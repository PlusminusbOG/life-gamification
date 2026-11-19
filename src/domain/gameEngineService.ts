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
  logTime(
    inputOrActivityId: LogTimeInput | string,
    durationMinutes?: number,
    notes?: string,
    timestamp?: number
  ): Promise<TimeLog>;
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
      throw new Error('Duration must be greater than zero');
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
        throw new Error(`Activity not found: ${activityId}`);
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

      // 3. Denormalize on UserProfile (O(1) hero total hours without floating point drift)
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
