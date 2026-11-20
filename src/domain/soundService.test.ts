import { describe, it, expect, beforeEach } from 'vitest';
import {
  isSoundEnabled,
  setSoundEnabled,
  playQuestCompleteSound,
  playLevelUpSound,
  playAchievementSound,
} from './soundService';

describe('Ticket 08: Web Audio Sound Service', () => {
  beforeEach(() => {
    // Reset mock localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('defaults to sound enabled if not set', () => {
    expect(isSoundEnabled()).toBe(true);
  });

  it('persists mute and unmute state correctly in localStorage', () => {
    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);

    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
  });

  it('sound play functions execute safely without throwing errors even in non-browser/node environment', () => {
    expect(() => playQuestCompleteSound()).not.toThrow();
    expect(() => playLevelUpSound()).not.toThrow();
    expect(() => playAchievementSound()).not.toThrow();
  });
});
