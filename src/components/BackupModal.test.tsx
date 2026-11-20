import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { BackupModal } from './BackupModal';

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, '');
}

describe('Ticket 06: BackupModal Component Tests', () => {
  it('renders modal with export and import sections, explanation, and action buttons', () => {
    const html = renderClean(
      <BackupModal
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Header & Titles
    expect(html).toContain('Суверенитет данных и Резервная копия');
    expect(html).toContain('Создание резервной копии (Экспорт)');
    expect(html).toContain('Восстановление базы из файла (Импорт)');

    // Export button
    expect(html).toContain('Скачать резервную копию (JSON)');

    // Conflict options
    expect(html).toContain('Полное восстановление (Replace)');
    expect(html).toContain('Объединение записей (Merge)');

    // Local-first assurance
    expect(html).toContain('Все операции происходят локально в вашем браузере');
  });

  it('returns null when isOpen is false', () => {
    const html = renderClean(
      <BackupModal
        isOpen={false}
        onClose={() => {}}
      />
    );

    expect(html).toBe('');
  });
});
