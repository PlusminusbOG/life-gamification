import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HeroCharacterSheet } from './HeroCharacterSheet';
import { XPProgressBar } from './XPProgressBar';
import type { UserProfile } from '../domain/types';

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, '');
}

describe('Variant B HeroCharacterSheet & XPProgressBar Component Rendering', () => {
  it('renders XPProgressBar accurately with progress percent, earned and remaining minutes', () => {
    const html = renderClean(
      <XPProgressBar
        totalMinutes={20}
        nextTitle="Спартанский Гоплит"
      />
    );

    // Level 2 (20 minutes): threshold 10, next 31 -> 10 earned, 11 remaining, 48%
    expect(html).toContain('48%');
    expect(html).toContain('10 мин');
    expect(html).toContain('11 мин');
    expect(html).toContain('Спартанский Гоплит');
  });

  it('renders HeroCharacterSheet in Variant B layout with avatar, tier, level, title and lifetime hours', () => {
    const mockProfile: UserProfile = {
      id: 'me',
      name: 'Александр',
      totalMinutes: 600, // 10 hours -> Level 12 (Hero of Hellas)
      totalHours: 10.0,
      createdAt: 1000,
      updatedAt: 1000,
    };

    const html = renderClean(
      <HeroCharacterSheet
        profile={mockProfile}
        totalActivities={4}
        totalLogsCount={15}
      />
    );

    // Verify Avatar & Greek gilded frame
    expect(html).toContain('hero-character-sheet');
    expect(html).toContain('hero-avatar');

    // Verify Name
    expect(html).toContain('Александр');

    // Verify Pantheon Tier & Title
    expect(html).toContain('Герой Эллады');
    expect(html).toContain('Аргонавт');

    // Verify Hero Level
    expect(html).toContain('УРОВЕНЬ 12');

    // Verify Lifetime Hours & stats
    expect(html).toContain('10.0 ч');
    expect(html).toContain('4'); // 4 activities
    expect(html).toContain('15'); // 15 logs
    expect(html).toContain('Вечные и несгораемые часы Эллады');
  });

  it('adapts theme and aesthetic dynamically for Ascendant God (100+)', () => {
    const godProfile: UserProfile = {
      id: 'me',
      name: 'Зевс Владыка',
      totalMinutes: 21000, // 350 hours -> Level 101
      totalHours: 350.0,
      createdAt: 1000,
      updatedAt: 1000,
    };

    const html = renderClean(
      <HeroCharacterSheet
        profile={godProfile}
        totalActivities={10}
        totalLogsCount={100}
      />
    );

    expect(html).toContain('Восходящий Бог');
    expect(html).toContain('Владыка Олимпа');
    expect(html).toContain('УРОВЕНЬ 101');
    expect(html).toContain('350.0 ч');
  });

  it('renders export hero card button when onExportHeroCard callback is passed', () => {
    const mockProfile: UserProfile = {
      id: 'me',
      name: 'Тесей',
      totalMinutes: 120,
      totalHours: 2.0,
      createdAt: 1000,
      updatedAt: 1000,
    };

    const html = renderClean(
      <HeroCharacterSheet
        profile={mockProfile}
        onExportHeroCard={() => {}}
      />
    );

    expect(html).toContain('export-hero-card-button');
    expect(html).toContain('Экспорт карточки героя');
  });
});
