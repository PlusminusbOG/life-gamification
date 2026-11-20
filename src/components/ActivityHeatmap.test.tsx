import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { TimeLog, Activity } from '../domain/types';

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, '');
}

describe('Ticket 07: ActivityHeatmap Component Tests', () => {
  const mockActivities: Activity[] = [
    {
      id: 'act-1',
      name: 'Кодинг',
      totalMinutes: 120,
      level: 4,
      createdAt: 1000,
      updatedAt: 1000,
    },
    {
      id: 'act-2',
      name: 'Бег',
      totalMinutes: 60,
      level: 2,
      createdAt: 1000,
      updatedAt: 1000,
    },
  ];

  const now = new Date(2026, 10, 20).getTime();
  const mockLogs: TimeLog[] = [
    {
      id: 'l1',
      activityId: 'act-1',
      durationMinutes: 90,
      timestamp: now,
      createdAt: now,
    },
  ];

  it('renders heatmap calendar with title, streak stats, legend, and filter', () => {
    const html = renderClean(
      <ActivityHeatmap
        timeLogs={mockLogs}
        activities={mockActivities}
        endDate={new Date(2026, 10, 20)}
        numWeeks={16}
      />
    );

    // Title & Legend
    expect(html).toContain('Летопись Подвигов');
    expect(html).toContain('Тепловая карта продуктивности');
    expect(html).toContain('Меньше');
    expect(html).toContain('Больше');

    // Stats
    expect(html).toContain('Активных дней');
    expect(html).toContain('Текущая серия');
    expect(html).toContain('Рекорд серии');

    // Filter
    expect(html).toContain('Все занятия');
    expect(html).toContain('Кодинг');
    expect(html).toContain('Бег');
  });
});
