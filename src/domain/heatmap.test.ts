import { describe, it, expect } from 'vitest';
import {
  formatDateKey,
  getHeatmapIntensity,
  calculateHeatmapData,
  calculateStreaks,
} from './heatmap';
import type { TimeLog, Activity } from './types';

describe('Ticket 07: Activity Heatmap Domain Engine', () => {
  const mockActivities: Activity[] = [
    {
      id: 'act-code',
      name: 'Кодинг',
      totalMinutes: 600,
      level: 8,
      createdAt: 1000,
      updatedAt: 1000,
    },
    {
      id: 'act-read',
      name: 'Чтение',
      totalMinutes: 300,
      level: 5,
      createdAt: 1000,
      updatedAt: 1000,
    },
  ];

  describe('1. formatDateKey', () => {
    it('formats dates consistently to YYYY-MM-DD with zero-padding', () => {
      const d = new Date(2026, 0, 5); // 5 Jan 2026
      expect(formatDateKey(d)).toBe('2026-01-05');

      const d2 = new Date(2026, 10, 20); // 20 Nov 2026
      expect(formatDateKey(d2)).toBe('2026-11-20');
    });
  });

  describe('2. getHeatmapIntensity', () => {
    it('maps minutes into 5-tier intensity levels (0 to 4)', () => {
      expect(getHeatmapIntensity(0)).toBe(0);
      expect(getHeatmapIntensity(15)).toBe(1);
      expect(getHeatmapIntensity(30)).toBe(1);
      expect(getHeatmapIntensity(45)).toBe(2);
      expect(getHeatmapIntensity(60)).toBe(2);
      expect(getHeatmapIntensity(90)).toBe(3);
      expect(getHeatmapIntensity(120)).toBe(3);
      expect(getHeatmapIntensity(180)).toBe(4);
    });
  });

  describe('3. calculateStreaks', () => {
    it('calculates current and longest streaks from active date keys', () => {
      // 3 consecutive days: Jan 1, 2, 3, gap on Jan 4, then Jan 5, 6
      const activeDays = new Set([
        '2026-01-01',
        '2026-01-02',
        '2026-01-03',
        '2026-01-05',
        '2026-01-06',
      ]);

      const result = calculateStreaks(activeDays, new Date(2026, 0, 6));
      expect(result.longestStreak).toBe(3); // Jan 1-3
      expect(result.currentStreak).toBe(2); // Jan 5-6
    });

    it('returns zero streaks when active set is empty', () => {
      const result = calculateStreaks(new Set(), new Date(2026, 0, 6));
      expect(result.longestStreak).toBe(0);
      expect(result.currentStreak).toBe(0);
    });
  });

  describe('4. calculateHeatmapData', () => {
    it('aggregates daily minutes across multiple logs and activities', () => {
      const day1 = new Date(2026, 10, 18).getTime();
      const day2 = new Date(2026, 10, 19).getTime();

      const timeLogs: TimeLog[] = [
        {
          id: 'l1',
          activityId: 'act-code',
          durationMinutes: 45,
          timestamp: day1,
          createdAt: day1,
        },
        {
          id: 'l2',
          activityId: 'act-read',
          durationMinutes: 30,
          timestamp: day1,
          createdAt: day1,
        },
        {
          id: 'l3',
          activityId: 'act-code',
          durationMinutes: 150,
          timestamp: day2,
          createdAt: day2,
        },
      ];

      const endDate = new Date(2026, 10, 20);
      const { stats, dayMap } = calculateHeatmapData({
        timeLogs,
        activities: mockActivities,
        endDate,
        numWeeks: 12,
      });

      expect(stats.totalActiveDays).toBe(2);
      expect(stats.totalMinutes).toBe(225); // 45 + 30 + 150

      const d1Data = dayMap.get('2026-11-18');
      expect(d1Data).toBeDefined();
      expect(d1Data?.totalMinutes).toBe(75);
      expect(d1Data?.level).toBe(3); // 75 mins -> level 3
      expect(d1Data?.activityMinutes['act-code']).toBe(45);
      expect(d1Data?.activityMinutes['act-read']).toBe(30);

      const d2Data = dayMap.get('2026-11-19');
      expect(d2Data).toBeDefined();
      expect(d2Data?.totalMinutes).toBe(150);
      expect(d2Data?.level).toBe(4); // 150 mins -> level 4
    });

    it('filters data when filterActivityId is provided', () => {
      const day1 = new Date(2026, 10, 18).getTime();

      const timeLogs: TimeLog[] = [
        {
          id: 'l1',
          activityId: 'act-code',
          durationMinutes: 60,
          timestamp: day1,
          createdAt: day1,
        },
        {
          id: 'l2',
          activityId: 'act-read',
          durationMinutes: 60,
          timestamp: day1,
          createdAt: day1,
        },
      ];

      const { stats, dayMap } = calculateHeatmapData({
        timeLogs,
        filterActivityId: 'act-read',
        endDate: new Date(2026, 10, 20),
        numWeeks: 4,
      });

      expect(stats.totalMinutes).toBe(60);
      const d1Data = dayMap.get('2026-11-18');
      expect(d1Data?.totalMinutes).toBe(60);
      expect(d1Data?.activityMinutes['act-read']).toBe(60);
      expect(d1Data?.activityMinutes['act-code']).toBeUndefined();
    });
  });
});
