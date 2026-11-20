import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ExportHeroCardModal } from './ExportHeroCardModal';
import { HeroCardPreview } from './HeroCardPreview';
import { buildHeroCardPayload } from '../domain/heroCardExport';
import type { UserProfile, Activity, AchievementWithDetails } from '../domain/types';

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, '');
}

describe('Ticket 05: ExportHeroCardModal & HeroCardPreview Component Tests', () => {
  const mockProfile: UserProfile = {
    id: 'me',
    name: 'Персей',
    totalMinutes: 900, // 15 hours -> Level 15 (Hero of Hellas)
    totalHours: 15.0,
    pinnedBadgeCodes: ['CRONUS_10H', 'HERACLES_1Q'],
    createdAt: 1000,
    updatedAt: 1000,
  };

  const mockActivities: Activity[] = [
    {
      id: 'act-1',
      name: 'Бег',
      totalMinutes: 600, // 10h (Primary)
      level: 10,
      createdAt: 1000,
      updatedAt: 1000,
    },
    {
      id: 'act-2',
      name: 'Медитация',
      totalMinutes: 300,
      level: 6,
      createdAt: 1001,
      updatedAt: 1001,
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
      description: 'Первый квест',
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
      code: 'CRONUS_50H',
      title: 'Копье Ахилла',
      titleEn: 'Spear of Achilles',
      description: '50 часов практики',
      category: 'cronus',
      categoryTitle: 'Дары Кроноса',
      icon: '🗡️',
      maxProgress: 50,
      progress: 15,
      progressPercent: 30,
      unlockedAt: null, // Locked
    },
  ];

  describe('HeroCardPreview', () => {
    it('renders real-time preview card with Greek pantheon styling, hero name, tier, level, hours, primary activity and badges', () => {
      const payload = buildHeroCardPayload({
        profile: mockProfile,
        activities: mockActivities,
        achievements: mockAchievements,
        pinnedBadgeCodes: ['CRONUS_10H', 'HERACLES_1Q'],
      });

      const html = renderClean(<HeroCardPreview payload={payload} />);

      // Hero Identity
      expect(html).toContain('Персей');
      expect(html).toContain('Герой Эллады');
      expect(html).toContain('УРОВЕНЬ 16');

      // Lifetime Hours
      expect(html).toContain('15.0 ч');

      // Primary Activity
      expect(html).toContain('Бег');
      expect(html).toContain('10 ч');

      // Pinned badges
      expect(html).toContain('Спартанский щит');
      expect(html).toContain('Немейский лев');
      expect(html).toContain('🛡️');
      expect(html).toContain('🦁');

      // Empty slot placeholder
      expect(html).toContain('Свободная регалия');
    });
  });

  describe('ExportHeroCardModal', () => {
    it('renders modal with unlocked achievements for selection, current count, and download button', () => {
      const html = renderClean(
        <ExportHeroCardModal
          isOpen={true}
          onClose={() => {}}
          profile={mockProfile}
          activities={mockActivities}
          achievements={mockAchievements}
          initialPinnedCodes={['CRONUS_10H']}
        />
      );

      // Header & Modal Title
      expect(html).toContain('Экспорт Карточки Героя');
      expect(html).toContain('Храм Достижений Олимпа');

      // Selection Counter
      expect(html).toContain('Выбрано');
      expect(html).toContain('из 5');

      // Unlocked achievements visible for selection
      expect(html).toContain('Спартанский щит');
      expect(html).toContain('Немейский лев');
      expect(html).toContain('Нить Ариадны: 3 дня');

      // Locked achievement should not be selectable in showcase
      expect(html).not.toContain('Копье Ахилла');

      // Download Button
      expect(html).toContain('Скачать карточку (1200x630 PNG)');
    });

    it('returns null when isOpen is false', () => {
      const html = renderClean(
        <ExportHeroCardModal
          isOpen={false}
          onClose={() => {}}
          profile={mockProfile}
          activities={mockActivities}
          achievements={mockAchievements}
        />
      );

      expect(html).toBe('');
    });

    it('shows informative notice when no achievements are unlocked yet', () => {
      const allLocked = mockAchievements.map((a) => ({ ...a, unlockedAt: null }));

      const html = renderClean(
        <ExportHeroCardModal
          isOpen={true}
          onClose={() => {}}
          profile={mockProfile}
          activities={mockActivities}
          achievements={allLocked}
        />
      );

      expect(html).toContain('Пока нет открытых регалий');
    });
  });
});
