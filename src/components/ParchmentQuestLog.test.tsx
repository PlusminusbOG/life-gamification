import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ParchmentQuestLog } from './ParchmentQuestLog';
import { FocusStopwatch } from './FocusStopwatch';
import { CreateQuestModal } from './CreateQuestModal';
import type { Quest, Activity } from '../domain/types';

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, '');
}

describe('Ticket 03: ParchmentQuestLog & FocusStopwatch Component Tests', () => {
  const mockActivities: Activity[] = [
    {
      id: 'act-1',
      name: 'Чтение книг',
      totalMinutes: 120,
      level: 5,
      createdAt: 1000,
      updatedAt: 1000,
    },
    {
      id: 'act-2',
      name: 'Спорт и бег',
      totalMinutes: 60,
      level: 4,
      createdAt: 1000,
      updatedAt: 1000,
    },
  ];

  const now = Date.now();
  const mockQuests: Quest[] = [
    {
      id: 'q-1',
      title: 'Прочитать 30 страниц философии',
      activityId: 'act-1',
      status: 'active',
      rewardMinutes: 45,
      dueDate: now, // Today
      createdAt: now,
    },
    {
      id: 'q-2',
      title: 'Пробежка 5 км',
      activityId: 'act-2',
      status: 'completed',
      rewardMinutes: 30,
      dueDate: now,
      completedAt: now,
      createdAt: now - 3600000,
    },
  ];

  it('renders ParchmentQuestLog with tabs, quest items, reward badges, and linked activities', () => {
    const html = renderClean(
      <ParchmentQuestLog
        quests={mockQuests}
        activities={mockActivities}
        onCompleteQuest={async () => {}}
        onDeleteQuest={async () => {}}
        onOpenCreateQuest={() => {}}
        onSaveStopwatchTime={async () => {}}
      />
    );

    // Verify tabs
    expect(html).toContain('Квесты дня');
    expect(html).toContain('Бэклог');
    expect(html).toContain('Секундомер');

    // Verify quest titles
    expect(html).toContain('Прочитать 30 страниц философии');
    expect(html).toContain('Пробежка 5 км');

    // Verify reward badges and linked activities
    expect(html).toContain('+45м XP');
    expect(html).toContain('Чтение книг');
    expect(html).toContain('+30м XP');
    expect(html).toContain('Спорт и бег');

    // Verify action button for active quest
    expect(html).toContain('Завершить');
    // Verify completed badge
    expect(html).toContain('Выполнен ✅');
  });

  it('renders FocusStopwatch component with monospace timer and activity selector', () => {
    const html = renderClean(
      <FocusStopwatch
        activities={mockActivities}
        onSaveTime={async () => {}}
      />
    );

    expect(html).toContain('Секундомер живого фокуса');
    expect(html).toContain('00:00:00');
    expect(html).toContain('Начать фокус');
    expect(html).toContain('Чтение книг');
  });

  it('renders CreateQuestModal with all XP reward options (+15m, +30m, +45m, +1h, +2h)', () => {
    const html = renderClean(
      <CreateQuestModal
        isOpen={true}
        onClose={() => {}}
        onCreate={async () => {}}
        activities={mockActivities}
        defaultIsToday={true}
      />
    );

    expect(html).toContain('Создать новый подвиг (квест)');
    expect(html).toContain('+15м XP');
    expect(html).toContain('+30м XP');
    expect(html).toContain('+45м XP');
    expect(html).toContain('+1ч XP');
    expect(html).toContain('+2ч XP');
    expect(html).toContain('Квесты дня (Сегодня)');
    expect(html).toContain('Бэклог (На потом)');
    expect(html).toContain('Чтение книг');
  });
});
