import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { TempleOfAchievements } from './TempleOfAchievements';
import type { AchievementWithDetails } from '../domain/types';

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, '');
}

describe('Ticket 04: TempleOfAchievements Component Tests', () => {
  const mockAchievements: AchievementWithDetails[] = [
    {
      id: 'ach-1',
      code: 'CRONUS_10H',
      title: 'Спартанский щит',
      titleEn: 'Spartan Shield',
      description: '10 часов осознанной практики в жизни',
      category: 'cronus',
      categoryTitle: 'Дары Кроноса',
      icon: '🛡️',
      maxProgress: 10,
      progress: 10,
      progressPercent: 100,
      unlockedAt: 1700000000000,
    },
    {
      id: 'ach-2',
      code: 'HERACLES_10Q',
      title: 'Лернейская гидра',
      titleEn: 'Lernaean Hydra',
      description: '10 выполненных квестов',
      category: 'heracles',
      categoryTitle: 'Подвиги Геракла',
      icon: '🐍',
      maxProgress: 10,
      progress: 4,
      progressPercent: 40,
      unlockedAt: null,
    },
    {
      id: 'ach-3',
      code: 'SECRET_NIGHT_OWL',
      title: 'Ночная Сова Афины',
      titleEn: "Athena's Owl Night Vigil",
      description: 'Глубокая концентрация под покровом ночи (сессия между 00:00 и 05:00)',
      category: 'secret',
      categoryTitle: 'Тайны Олимпа',
      icon: '🦉',
      maxProgress: 1,
      progress: 0,
      progressPercent: 0,
      isSecret: true,
      unlockedAt: null, // Locked secret
    },
  ];

  it('renders TempleOfAchievements with category tabs, total summary counter, and badges', () => {
    const html = renderClean(<TempleOfAchievements achievements={mockAchievements} />);

    // Header and summary
    expect(html).toContain('Храм Достижений Олимпа');
    expect(html).toContain('1 из 3');
    expect(html).toContain('33%');

    // Category tabs
    expect(html).toContain('Все достижения');
    expect(html).toContain('Дары Кроноса');
    expect(html).toContain('Подвиги Геракла');
    expect(html).toContain('Нить Ариадны');
    expect(html).toContain('Семь Муз');
    expect(html).toContain('Тайны Олимпа');

    // Unlocked achievement
    expect(html).toContain('Спартанский щит');
    expect(html).toContain('Открыто');
    expect(html).toContain('Бессмертная регалия');

    // Locked standard achievement with progress
    expect(html).toContain('Лернейская гидра');
    expect(html).toContain('4 / 10');
    expect(html).toContain('40%');

    // Secret locked achievement
    expect(html).toContain('Скрытое достижение');
    expect(html).toContain('Выполните тайное условие Олимпа для открытия');
    expect(html).toContain('Тайна');
    expect(html).not.toContain('Ночная Сова Афины'); // Hidden condition
  });

  it('reveals secret achievement once unlockedAt is present', () => {
    const revealedSecret: AchievementWithDetails[] = [
      {
        ...mockAchievements[2],
        unlockedAt: 1700050000000,
        progress: 1,
        progressPercent: 100,
      },
    ];

    const html = renderClean(<TempleOfAchievements achievements={revealedSecret} />);

    expect(html).toContain('Ночная Сова Афины');
    expect(html).toContain('Глубокая концентрация под покровом ночи');
    expect(html).toContain('Открыто');
  });
});
