import { describe, it, expect } from 'vitest';
import {
  getPrimaryActivity,
  togglePinnedBadge,
  buildHeroCardPayload,
  generateHeroCardFilename,
  MAX_PINNED_BADGES,
} from './heroCardExport';
import type {
  Activity,
  UserProfile,
  AchievementWithDetails,
} from './types';

describe('Ticket 05: Hero Card Export & Badge Showcase Domain Engine', () => {
  const mockActivities: Activity[] = [
    {
      id: 'act-1',
      name: 'Чтение',
      totalMinutes: 120, // 2h
      level: 4,
      createdAt: 1000,
      updatedAt: 1000,
    },
    {
      id: 'act-2',
      name: 'Программирование',
      totalMinutes: 900, // 15h (Primary)
      level: 15,
      createdAt: 1001,
      updatedAt: 1001,
    },
    {
      id: 'act-3',
      name: 'Бег',
      totalMinutes: 60, // 1h
      level: 2,
      createdAt: 1002,
      updatedAt: 1002,
    },
  ];

  const mockAchievements: AchievementWithDetails[] = [
    {
      id: '1',
      code: 'CRONUS_10H',
      title: 'Спартанский щит',
      titleEn: 'Spartan Shield',
      description: '10 часов осознанной практики',
      category: 'cronus',
      categoryTitle: 'Дары Кроноса',
      icon: '🛡️',
      maxProgress: 10,
      progress: 10,
      progressPercent: 100,
      unlockedAt: 1700000000000,
    },
    {
      id: '2',
      code: 'HERACLES_1Q',
      title: 'Немейский лев',
      titleEn: 'Nemean Lion',
      description: 'Первый выполненный квест',
      category: 'heracles',
      categoryTitle: 'Подвиги Геракла',
      icon: '🦁',
      maxProgress: 1,
      progress: 1,
      progressPercent: 100,
      unlockedAt: 1700001000000,
    },
    {
      id: '3',
      code: 'ARIADNE_3D',
      title: 'Нить Ариадны: 3 дня',
      titleEn: "Ariadne's Thread: 3 Days",
      description: '3 активных дня',
      category: 'ariadne',
      categoryTitle: 'Нить Ариадны',
      icon: '🧵',
      maxProgress: 3,
      progress: 3,
      progressPercent: 100,
      unlockedAt: 1700002000000,
    },
    {
      id: '4',
      code: 'MUSES_3_LVL5',
      title: 'Гармония Муз',
      titleEn: 'Harmony of the Muses',
      description: '3 занятия 5+ уровня',
      category: 'muses',
      categoryTitle: 'Семь Муз',
      icon: '🎭',
      maxProgress: 3,
      progress: 3,
      progressPercent: 100,
      unlockedAt: 1700003000000,
    },
    {
      id: '5',
      code: 'SECRET_NIGHT_OWL',
      title: 'Ночная Сова Афины',
      titleEn: "Athena's Owl Night Vigil",
      description: 'Ночная сессия',
      category: 'secret',
      categoryTitle: 'Тайны Олимпа',
      icon: '🦉',
      maxProgress: 1,
      progress: 1,
      progressPercent: 100,
      unlockedAt: 1700004000000,
    },
    {
      id: '6',
      code: 'CRONUS_50H',
      title: 'Копье Ахилла',
      titleEn: 'Spear of Achilles',
      description: '50 часов практики',
      category: 'cronus',
      categoryTitle: 'Дары Кроноса',
      icon: '🗡️',
      maxProgress: 50,
      progress: 18,
      progressPercent: 36,
      unlockedAt: null, // Locked
    },
  ];

  describe('1. getPrimaryActivity', () => {
    it('returns null when activities list is empty', () => {
      expect(getPrimaryActivity([])).toBeNull();
    });

    it('returns null when all activities have 0 minutes logged', () => {
      const zeroActivities: Activity[] = [
        { ...mockActivities[0], totalMinutes: 0 },
        { ...mockActivities[1], totalMinutes: 0 },
      ];
      expect(getPrimaryActivity(zeroActivities)).toBeNull();
    });

    it('returns the activity with the highest accumulated minutes', () => {
      const primary = getPrimaryActivity(mockActivities);
      expect(primary).not.toBeNull();
      expect(primary?.id).toBe('act-2');
      expect(primary?.name).toBe('Программирование');
      expect(primary?.totalMinutes).toBe(900);
    });
  });

  describe('2. togglePinnedBadge & max 5 capping', () => {
    it('adds a badge to the pinned list when below max limit of 5', () => {
      const current: string[] = ['CRONUS_10H', 'HERACLES_1Q'];
      const result = togglePinnedBadge(current, 'ARIADNE_3D');

      expect(result.error).toBeUndefined();
      expect(result.pinned).toEqual(['CRONUS_10H', 'HERACLES_1Q', 'ARIADNE_3D']);
    });

    it('removes a badge when it is already in the pinned list (unpinning)', () => {
      const current: string[] = ['CRONUS_10H', 'HERACLES_1Q', 'ARIADNE_3D'];
      const result = togglePinnedBadge(current, 'HERACLES_1Q');

      expect(result.error).toBeUndefined();
      expect(result.pinned).toEqual(['CRONUS_10H', 'ARIADNE_3D']);
    });

    it('enforces maximum 5 badge capping and returns error when attempting to add a 6th badge', () => {
      const current5: string[] = [
        'CRONUS_10H',
        'HERACLES_1Q',
        'ARIADNE_3D',
        'MUSES_3_LVL5',
        'SECRET_NIGHT_OWL',
      ];

      expect(current5.length).toBe(MAX_PINNED_BADGES);

      // Attempt to pin a 6th badge
      const result = togglePinnedBadge(current5, 'CRONUS_50H');

      expect(result.error).toBe('Максимум 5 регалий на карточке Героя');
      expect(result.pinned).toEqual(current5); // Unchanged
    });

    it('allows unpinning even when at max limit of 5', () => {
      const current5: string[] = [
        'CRONUS_10H',
        'HERACLES_1Q',
        'ARIADNE_3D',
        'MUSES_3_LVL5',
        'SECRET_NIGHT_OWL',
      ];

      const result = togglePinnedBadge(current5, 'CRONUS_10H');
      expect(result.error).toBeUndefined();
      expect(result.pinned.length).toBe(4);
      expect(result.pinned).not.toContain('CRONUS_10H');
    });
  });

  describe('3. buildHeroCardPayload', () => {
    it('constructs a rich payload with Greek pantheon tier, level, primary activity, and pinned badges', () => {
      const mockProfile: UserProfile = {
        id: 'me',
        name: 'Одиссей Мудрый',
        totalMinutes: 1080, // 18 hours -> Hero of Hellas (Level 18)
        totalHours: 18.0,
        createdAt: 1000,
        updatedAt: 1000,
      };

      const pinnedCodes = ['CRONUS_10H', 'HERACLES_1Q', 'SECRET_NIGHT_OWL'];

      const payload = buildHeroCardPayload({
        profile: mockProfile,
        activities: mockActivities,
        achievements: mockAchievements,
        pinnedBadgeCodes: pinnedCodes,
      });

      expect(payload.heroName).toBe('Одиссей Мудрый');
      expect(payload.tier).toBe('Герой Эллады');
      expect(payload.tierCode).toBe('hero');
      expect(payload.level).toBe(17);
      expect(payload.totalHoursFormatted).toBe('18.0 ч');
      expect(payload.primaryActivity).toEqual({
        name: 'Программирование',
        hours: 15,
        level: 15,
      });
      expect(payload.pinnedBadges.length).toBe(3);
      expect(payload.pinnedBadges[0].code).toBe('CRONUS_10H');
      expect(payload.pinnedBadges[0].title).toBe('Спартанский щит');
      expect(payload.pinnedBadges[0].icon).toBe('🛡️');
      expect(payload.unlockedCount).toBe(5);
      expect(payload.totalAchievementsCount).toBe(6);
    });

    it('filters out locked or non-existent badges from pinnedBadges in payload', () => {
      const mockProfile: UserProfile = {
        id: 'me',
        name: 'Ахиллес',
        totalMinutes: 300,
        totalHours: 5.0,
        createdAt: 1000,
        updatedAt: 1000,
      };

      // CRONUS_50H is locked, NON_EXISTENT does not exist
      const pinnedCodes = ['CRONUS_10H', 'CRONUS_50H', 'NON_EXISTENT'];

      const payload = buildHeroCardPayload({
        profile: mockProfile,
        activities: mockActivities,
        achievements: mockAchievements,
        pinnedBadgeCodes: pinnedCodes,
      });

      // Only CRONUS_10H is unlocked and valid
      expect(payload.pinnedBadges.length).toBe(1);
      expect(payload.pinnedBadges[0].code).toBe('CRONUS_10H');
    });

    it('provides graceful fallbacks for missing profile or activities', () => {
      const payload = buildHeroCardPayload({
        profile: undefined,
        activities: [],
        achievements: [],
        pinnedBadgeCodes: [],
      });

      expect(payload.heroName).toBe('Герой Эллады');
      expect(payload.tier).toBe('Смертный');
      expect(payload.level).toBe(1);
      expect(payload.totalHoursFormatted).toBe('0.0 ч');
      expect(payload.primaryActivity).toBeNull();
      expect(payload.pinnedBadges).toEqual([]);
    });
  });

  describe('4. generateHeroCardFilename', () => {
    it('generates filename with hero-card prefix, provided timestamp, and .png extension', () => {
      const ts = 1700000000123;
      expect(generateHeroCardFilename(ts)).toBe('hero-card-1700000000123.png');
    });

    it('defaults to current timestamp if none provided', () => {
      const before = Date.now();
      const filename = generateHeroCardFilename();
      const after = Date.now();

      expect(filename).toMatch(/^hero-card-\d+\.png$/);
      const extractedTs = Number(filename.replace('hero-card-', '').replace('.png', ''));
      expect(extractedTs).toBeGreaterThanOrEqual(before);
      expect(extractedTs).toBeLessThanOrEqual(after);
    });
  });
});
